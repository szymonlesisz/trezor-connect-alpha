/* @flow */
'use strict';

import EventEmitter from 'events';
import ConfigManager from '../utils/ConfigManager';
import DeviceList, { getDeviceList } from '../device/DeviceList';
import Device from '../device/Device';
import type { DeviceDescription } from '../device/Device';

import * as DEVICE from '../constants/device';
import * as POPUP from '../constants/popup';
import * as UI from '../constants/ui';
import * as IFRAME from '../constants/iframe';
import * as ERROR from '../constants/errors';

import { UiMessage, DeviceMessage, ResponseMessage } from './ChannelMessage';
import type { ChannelMessage } from './ChannelMessage';

import { parse as parseParams } from './methods/parameters';
import type { MethodParams, MethodCallbacks } from './methods/parameters';
import { requestPermissions } from './methods/permissions';


import { create as createDeferred } from '../utils/deferred';
import type { Deferred } from '../utils/deferred';

import { resolveAfter } from '../utils/promiseUtils'; // TODO: just tmp. remove
import { getPathFromIndex } from '../utils/pathUtils';

import Log, { init as initLog, enable as enableLog, enableByPrefix as enableLogByPrefix } from '../utils/debug';
import { parse as parseSettings } from './ConnectSettings';


// Public variables
let _channel: Channel;                  // Class with event emitter
let _deviceList: ?DeviceList;           // Instance of DeviceList
let _parameters: ?MethodParams;         // Incoming parsed params
let _popupPromise: ?Deferred<void>;     // Waiting for popup handshake
let _uiPromise: ?Deferred<string>;      // Waiting fo ui response
let _waitForLoad: boolean = false;      // used in corner-case, where device.isRunning() === true but it's not loaded yet.

export const CHANNEL_EVENT: string = 'CHANNEL_EVENT';

// custom log
const logger: Log = initLog('Channel');


/**
 * Creates an instance of _popupPromise.
 * If Channel is used without popup this promise should be always resolved
 * @returns {Promise<void>}
 * @memberof Channel
 */
const getPopupPromise = (requestWindow: boolean = true): Deferred<void> => {
    // request ui window (used with modal)
    if (requestWindow)
        postMessage(new UiMessage(UI.REQUEST_UI_WINDOW));
    if (!_popupPromise)
        _popupPromise = createDeferred();
    return _popupPromise;
}

/**
 * Creates an instance of _uiPromise.
 * @returns {Promise<string>}
 * @memberof Channel
 */
const getUiPromise = (): Deferred<string> => {
    if (!_uiPromise)
        _uiPromise = createDeferred();
    return _uiPromise;
}

/**
 * Emit message to listener (parent).
 * @param {ChannelMessage} message
 * @returns {void}
 * @memberof Channel
 */
const postMessage = (message: ChannelMessage): void => {
    _channel.emit(CHANNEL_EVENT, message);
}

/**
 * Handle incoming message.
 * @param {Object} data
 * @returns {void}
 * @memberof Channel
 */
export const handleMessage = (message: ChannelMessage): void => {
    console.log("handle message in channel", message)
    switch(message.type) {

        // communication with popup
        case POPUP.OPENED :
        break;

        case POPUP.HANDSHAKE :
            getPopupPromise(false).resolve();
        break;
        case POPUP.CLOSED :
            onPopupClosed();
        break;

        case UI.CHANGE_SETTINGS :
            enableLog( parseSettings(message.data).debug );
        break;

        // messages from UI (popup/modal...)
        case UI.RECEIVE_DEVICE :
        case UI.RECEIVE_CONFIRMATION :
        case UI.RECEIVE_PERMISSION :
        case UI.RECEIVE_PIN :
        case UI.RECEIVE_PASSPHRASE :
        case UI.RECEIVE_ACCOUNT :
        case UI.RECEIVE_FEE :
            // TODO: throw error if not string
            if (_uiPromise && typeof message.data === 'string')
                _uiPromise.resolve(message.data);
            _uiPromise = null;
        break;

        // message from index
        case IFRAME.CALL :
            onCall(message).catch(error => {
                logger.debug("onCall error", error);
            });
        break;
    }
};

/**
 * Find device by device path. Returned device may be unacquired.
 * @param {string|undefined} devicePath
 * @returns {Promise<Device>}
 * @memberof Channel
 */
const initDevice = async (devicePath: ?string): Promise<Device> => {

    if (!_deviceList) {
        throw ERROR.NO_TRANSPORT;
    }

    let device: ?Device;
    if (devicePath) {
        device = _deviceList.getDevice(devicePath);
    } else {
        let devicesCount: number = _deviceList.length();
        let selectedDevicePath: string;
        if (devicesCount === 1) {
            // there is only one device available
            selectedDevicePath = _deviceList.getFirstDevicePath();
            device = _deviceList.getDevice(selectedDevicePath);
        } else {
            // wait for popup handshake
            await getPopupPromise().promise;

            // check again, there was possible change
            devicesCount = _deviceList.length();
            if (devicesCount === 1) {
                selectedDevicePath = _deviceList.getFirstDevicePath();
                device = _deviceList.getDevice(selectedDevicePath);
            } else {
                // do not release device after init connection
                _deviceList.setReleaseAfterConnect(false);
                // request select device view
                postMessage(new UiMessage(UI.SELECT_DEVICE, _deviceList.asArray()));
                // wait for device selection
                selectedDevicePath = await getUiPromise().promise;
                device = _deviceList.getDevice(selectedDevicePath);
            }
        }
    }

    if (!device) {
        throw ERROR.DEVICE_NOT_FOUND;
    }
    return device;
}

/**
 * Check device state.
 * @param {Device} device
 * @param {string} requiredFirmware
 * @returns {string|null}
 * @memberof Channel
 */
const checkDeviceState = (device: Device, requiredFirmware: string): ?string => {
    if (device.isBootloader()) {
        return UI.BOOTLOADER;
    }
    if (!device.isInitialized()) {
        return UI.INITIALIZE;
    }
    if (!device.atLeast(requiredFirmware)) {
        return UI.FIRMWARE;
    }
    return null;
}

/**
 * Force authentication by getting public key of first account
 * @param {Device} device
 * @returns {Promise<void>}
 * @memberof Channel
 */
const requestAuthentication = async (device: Device): Promise<void> => {
    // wait for popup handshake
    await getPopupPromise().promise;

    // show pin and passphrase
    const path: Array<number> = getPathFromIndex(0);
    await device.getCommands().getPublicKey(path);
}

/**
 * Processing incoming message.
 * This method is async that's why it returns Promise but the real response is passed by postMessage(new ResponseMessage)
 * @param {Object} incomingData
 * @returns {Promise<void>}
 * @memberof Channel
 */



export const onCall = async (message: ChannelMessage): Promise<void> => {

    if (!message.id || !message.data) {
        throw ERROR.INVALID_PARAMETERS;
    }

    const responseID: number = message.id;
    const incomingParams: Object = message.data;

    // parse incoming params
    let parameters: MethodParams;
    try {
        parameters = parseParams(message);
    } catch (error) {

        postMessage(new UiMessage(POPUP.CANCEL_POPUP_REQUEST));
        postMessage(new ResponseMessage(responseID, false, { error: ERROR.INVALID_PARAMETERS.message + ': ' + error.message } ));
        throw ERROR.INVALID_PARAMETERS;
    }

    // if method is using device (there could be only calls to backend or hd-wallet)
    if (!parameters.useDevice) {
        // TODO: call fn and handle interruptions
    }

    // find device
    let device: Device;
    try {
        device = await initDevice(parameters.deviceID);
    } catch (error) {
        if (error === ERROR.NO_TRANSPORT) {
            // wait for popup handshake
            await getPopupPromise().promise;
            postMessage(new UiMessage(UI.TRANSPORT));
        } else {
            postMessage(new UiMessage(POPUP.CANCEL_POPUP_REQUEST));
        }
        postMessage(new ResponseMessage(responseID, false, { error: error.message } ));
        throw error;
    }

    // if device is currently busy
    if (device.isRunning()) {
        // corner case
        // device didn't finish loading for the first time. @see DeviceList._createAndSaveDevice
        // wait for self-release and then carry on
        if (!_waitForLoad && !device.isLoaded()) {
            _waitForLoad = true;
            await device.waitForLoad();
            _waitForLoad = false;
        } else {
            postMessage(new ResponseMessage(responseID, false, { error: ERROR.DEVICE_CALL_IN_PROGRESS.message } ));
            throw ERROR.DEVICE_CALL_IN_PROGRESS;
        }
    }

    // device is available
    // set public variables, listeners and run method
    device.on(DEVICE.PIN, onDevicePinHandler);
    device.on(DEVICE.PASSPHRASE, onDevicePassphraseHandler);
    device.on(DEVICE.BUTTON, onDeviceButtonHandler);
    device.on(DEVICE.AUTHENTICATED, () => {
        if (!parameters.useUi)
            postMessage(new UiMessage(POPUP.CANCEL_POPUP_REQUEST));
    });

    // before acquire session, check if UI will be needed in future
    // and if device is already authenticated
    if (!parameters.useUi && device.isAuthenticated()){
        // TODO ???
        postMessage(new UiMessage(POPUP.CANCEL_POPUP_REQUEST));
    }

    try {
        // This function will run inside Device.run() after device acquired and initialized
        const inner = async (): Promise<void> => {

            // check if device is in unexpected state (bootloader, not-initialized, old firmware)
            const state: ?string = await checkDeviceState(device, parameters.requiredFirmware);
            if (state) {
                // wait for popup handshake
                await getPopupPromise().promise;
                // show unexpected state information
                postMessage(new UiMessage(state));
                return Promise.resolve();
                //return Promise.reject();
            }

            // device is ready
            // set parameters as public variable, from now on this is reference to work with
            // this variable will be cleared in cleanup()
            _parameters = parameters;
            _parameters.deviceID = device.getDevicePath();

            // create callbacks collection
            // this will be used inside methods to communicate with Device or UI
            const callbacks: MethodCallbacks = {
                device,
                postMessage,
                getPopupPromise,
                getUiPromise
            }

            // check and request permissions
            if (_parameters.requiredPermissions.length > 0) {
                // show permissions in UI
                const permitted: boolean = await requestPermissions(_parameters.requiredPermissions, callbacks);
                if (!permitted) {
                    postMessage(new ResponseMessage(_parameters.responseID, false, { error: ERROR.PERMISSIONS_NOT_GRANTED.message } ));
                    closePopup();
                    return Promise.resolve();
                }
            }

            // before authentication, ask for confirmation if needed [export xpub, sign message]
            if (typeof _parameters.confirmation === 'function') {
                // show confirmation in UI
                const confirmed: boolean = await _parameters.confirmation.apply(this, [ _parameters, callbacks ]);
                if (!confirmed) {
                    postMessage(new ResponseMessage(_parameters.responseID, false, { error: "Cancelled" } ));
                    closePopup();
                    return Promise.resolve();
                }
            }

            if (!device.isAuthenticated()) {
                try {
                    await requestAuthentication(device);
                } catch (error) {
                    // catch wrong pin
                    // TODO: filter error
                    postMessage(new UiMessage(UI.INVALID_PIN));
                    return inner();
                }
            }
            // TODO: close popup when sure that popup is not needed anymore
            // closePopup();
            // _popupPromise = null;

            // wait for popup handshake
            if (_parameters.useUi){
                await getPopupPromise().promise;
            }

            // run method
            //let response: Object = await method.apply(this, [ parameters, callbacks ]);
            try {
                let response: Object = await _parameters.method.apply(this, [ parameters, callbacks ]);

                postMessage(new ResponseMessage(_parameters.responseID, true, response));
            } catch(error) {
                //throw err2;
                console.log("AAAAA!", error)
                postMessage(new ResponseMessage(_parameters.responseID, false, { error: error.message } ));
                return Promise.resolve();
            }


        }
        // run inner function
        await device.run(inner);
    } catch (error) {
        if (_parameters)
            postMessage(new ResponseMessage(_parameters.responseID, false, { error: error.message } ));
    } finally {
        // Work done
        device.release();
        device.removeAllListeners();
        cleanup();
    }
}

/**
 * Clean up all variables and references.
 * @returns {void}
 * @memberof Channel
 */
const cleanup = (): void => {
    closePopup();
    _popupPromise = null;
    _uiPromise = null;
    _parameters = null;
    logger.debug("Cleanup...");
}

/**
 * Force close popup.
 * @returns {void}
 * @memberof Channel
 */
const closePopup = (): void => {
    postMessage(new UiMessage(UI.CLOSE_UI_WINDOW));
}


/**
 * Handle button request from Device.
 * @param {string} code
 * @returns {Promise<void>}
 * @memberof Channel
 */
const onDeviceButtonHandler = async (code: string): Promise<void> => {
    logger.warn("TODO: onDeviceButtonHandler");
    postMessage(new DeviceMessage(DEVICE.BUTTON, code));
}

/**
 * Handle pin request from Device.
 * @param {string} type
 * @param {Function} callback // TODO: add params
 * @returns {Promise<void>}
 * @memberof Channel
 */
const onDevicePinHandler = async (type: string, callback: (error: any, success: any) => void): Promise<void> => {
    // request pin view
    postMessage(new UiMessage(UI.REQUEST_PIN));
    // wait for pin
    const pin: string = await getUiPromise().promise;
    callback.apply(null, [null, pin]);
}

/**
 * Handle pin request from Device.
 * @param {Function} callback // TODO: add params
 * @returns {Promise<void>}
 * @memberof Channel
 */
const onDevicePassphraseHandler = async (callback: (error: any, success: any) => void): Promise<void> => {
    // request passphrase view
    postMessage(new UiMessage(UI.REQUEST_PASSPHRASE));
    // wait for passphrase
    const pass: string = await getUiPromise().promise;
    callback.apply(null, [null, pass]);
}

/**
 * Handle popup closed by user.
 * @returns {void}
 * @memberof Channel
 */
const onPopupClosed = (): void => {
    if (!_popupPromise) return;

    // Device was already acquired. Try to interrupt running action which will throw error from onCall try/catch block
    if (_parameters && _parameters.deviceID && _deviceList) {
        //const device: Device = _deviceList.getDevice(_parameters.device.getDevicePath());
        const device: Device = _deviceList.getDevice(_parameters.deviceID);
        if (device && device.isUsedHere()) {
            device.interruptionFromUser(ERROR.POPUP_CLOSED);
        }
    // Waiting for device. Throw error before onCall try/catch block
    } else {
        if (_uiPromise) {
            _uiPromise.reject(ERROR.POPUP_CLOSED);
            _uiPromise = null;
        }
        _popupPromise.reject(ERROR.POPUP_CLOSED);
        _popupPromise = null;
        cleanup();
    }
}

/**
 * Handle DeviceList changes.
 * If there is _uiPromise waiting for device selection update view.
 * @returns {void}
 * @memberof Channel
 */
const handleDeviceSelectionChanges = (): void => {
    if (_uiPromise && _deviceList) {
        // add new connected device to list
        let list: Array<Object> = _deviceList.asArray();
        if (list.length === 1) {
            // there is only one device, use it
            _uiPromise.resolve(list[0].path);
            _uiPromise = null;
        } else {
            // update device selection list view
            postMessage(new UiMessage(UI.SELECT_DEVICE, list));
        }
    }
}

/**
 * Start DeviceList with listeners.
 * @returns {Promise<void>}
 * @memberof Channel
 */
const initDeviceList = async (): Promise<void> => {
    try {
        _deviceList = await getDeviceList();

        // _deviceList.on(DEVICE.ACQUIRED, (device: DeviceDescription) => {
        //     if (_deviceList && _uiPromise && device.isUsedElsewhere) {
        //         //postMessage(new UiMessage(POPUP.CANCEL_POPUP_REQUEST));
        //         _deviceList.setReleaseAfterConnect(true);
        //         _uiPromise.reject(ERROR.DEVICE_USED_ELSEWHERE);
        //         //cleanup();
        //     }
        // });

        _deviceList.on(DEVICE.CONNECT, (device: DeviceDescription) => {
            handleDeviceSelectionChanges();
            postMessage(new DeviceMessage(DEVICE.CONNECT, device));
        });

        _deviceList.on(DEVICE.CONNECT_UNACQUIRED, (device: DeviceDescription) => {
            //handleDeviceSelectionChanges();
            postMessage(new DeviceMessage(DEVICE.CONNECT, device));
        });

        _deviceList.on(DEVICE.DISCONNECT, (device: DeviceDescription) => {
            handleDeviceSelectionChanges();
            postMessage(new DeviceMessage(DEVICE.DISCONNECT, device));
        });

        _deviceList.on(DEVICE.DISCONNECT_UNACQUIRED, (device: DeviceDescription) => {
            //handleDeviceSelectionChanges();
            postMessage(new DeviceMessage(DEVICE.DISCONNECT, device));
        });

        _deviceList.on(DEVICE.USED_ELSEWHERE, (device: DeviceDescription) => {
            // TODO: not sure what it does?
            // if (device.isUsedElsewhere) {
            //     postMessage(new UiMessage(POPUP.CANCEL_POPUP_REQUEST));
            // }
            postMessage(new DeviceMessage(DEVICE.USED_ELSEWHERE, device));
        });

        _deviceList.on(DEVICE.ERROR, error => {
            _deviceList = null;
            postMessage(new DeviceMessage(DEVICE.ERROR, error.message || error));
        });

    } catch (error) {
        _deviceList = null;
        // reconnect
        resolveAfter(1000, null).then(() => { initDeviceList() } );
        postMessage(new DeviceMessage(DEVICE.ERROR, error.message || error));
    }
}

/**
 * An event emitter for communication with parent.
 * @extends EventEmitter
 * @memberof Channel
 */
export class Channel extends EventEmitter {
    constructor() {
        super();
    }
    handleMessage(message: Object): void {
        handleMessage(message);
    }
}

/**
 * Init instance of Channel event emitter.
 * @returns {Channel}
 * @memberof Channel
 */
const initChannel = (): Channel => {
    _channel = new Channel();
    return _channel;
}

/**
 * Module initialization.
 * This will download the config.json, start DeviceList, init Channel emitter instance.
 * Returns Channel, an event emitter instance.
 * @param {Object} settings - optional // TODO
 * @returns {Promise<Channel>}
 * @memberof Channel
 */
export const init = async (settings: Object = {}): Promise<Channel> => {
    try {
        await ConfigManager.load();
        await initDeviceList();
        return await initChannel();
    } catch(error) {
        // TODO: kill app
        //postMessage(new IframeMessage(IFRAME.ERROR));
        logger.error("Init error", error);
        throw error;
    }
}
