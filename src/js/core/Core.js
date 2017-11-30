/* @flow */
'use strict';

import EventEmitter from 'events';
import DataManager from '../data/DataManager';
import DeviceList, { getDeviceList } from '../device/DeviceList';
import Device from '../device/Device';
import type { DeviceDescription } from '../device/Device';



import * as DEVICE from '../constants/device';
import * as POPUP from '../constants/popup';
import * as UI from '../constants/ui';
import * as IFRAME from '../constants/iframe';
import * as ERROR from '../constants/errors';

import { UiMessage, DeviceMessage, ResponseMessage } from './CoreMessage';
import type { CoreMessage, UiPromiseResponse } from './CoreMessage';

import { parse as parseParams } from './methods/parameters';
import type { MethodParams, MethodCallbacks } from './methods/parameters';
import { requestPermissions } from './methods/permissions';


import { create as createDeferred } from '../utils/deferred';
import type { Deferred } from '../utils/deferred';

import { resolveAfter } from '../utils/promiseUtils'; // TODO: just tmp. remove
import { getPathFromIndex } from '../utils/pathUtils';

import Log, { init as initLog, enable as enableLog, enableByPrefix as enableLogByPrefix } from '../utils/debug';

import { parse as parseSettings } from '../entrypoints/ConnectSettings';
import type { MessageResponse } from '../device/DeviceCommands';
import type { ConnectSettings } from '../entrypoints/ConnectSettings';


// Public variables
let _core: Core;                        // Class with event emitter
let _deviceList: ?DeviceList;           // Instance of DeviceList
let _parameters: ?MethodParams;         // Incoming parsed params
let _popupPromise: ?Deferred<void>;     // Waiting for popup handshake
//let _uiPromise: ?Deferred<string>;      // Waiting for ui response
let _uiPromise: ?Deferred<UiPromiseResponse>;      // Waiting for ui response
let _waitForFirstRun: boolean = false;  // used in corner-case, where device.isRunning() === true but it isn't loaded yet.

export const CORE_EVENT: string = 'CORE_EVENT';

// custom log
const logger: Log = initLog('Core');

/**
 * Creates an instance of _popupPromise.
 * If Core is used without popup this promise should be always resolved
 * @returns {Promise<void>}
 * @memberof Core
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
 * @memberof Core
 */
//const getUiPromise = (): Deferred<string> => {
const getUiPromise = (): Deferred<UiPromiseResponse> => {
    if (!_uiPromise)
        _uiPromise = createDeferred();
    return _uiPromise;
}

/**
 * Emit message to listener (parent).
 * @param {CoreMessage} message
 * @returns {void}
 * @memberof Core
 */
const postMessage = (message: CoreMessage): void => {
    _core.emit(CORE_EVENT, message);
}

/**
 * Handle incoming message.
 * @param {Object} data
 * @returns {void}
 * @memberof Core
 */
export const handleMessage = (message: CoreMessage): void => {
    console.log("handle message in core", message)
    switch(message.type) {

        // communication with popup
        // case POPUP.OPENED :
        // break;

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
        case UI.CHANGE_ACCOUNT :
        case UI.RECEIVE_FEE :
            // TODO: throw error if not string
            if (_uiPromise)
                _uiPromise.resolve( { event: message.type, data: message.data } );
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
 * @memberof Core
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

            // check again, there were possible changes before popup open
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
                let uiResp: UiPromiseResponse = await getUiPromise().promise;
                selectedDevicePath = uiResp.data;
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
 * @memberof Core
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
 * @memberof Core
 */
const requestAuthentication = async (device: Device): Promise<void> => {
    // wait for popup handshake
    await getPopupPromise().promise;

    // show pin and passphrase
    const path: Array<number> = getPathFromIndex(44, 0, 0);
    await device.getCommands().getPublicKey(path, 'Bitcoin');
}

/**
 * Processing incoming message.
 * This method is async that's why it returns Promise but the real response is passed by postMessage(new ResponseMessage)
 * @param {Object} incomingData
 * @returns {Promise<void>}
 * @memberof Core
 */
export const onCall = async (message: CoreMessage): Promise<void> => {

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
        if (!_waitForFirstRun && !device.isLoaded()) {
            _waitForFirstRun = true;
            await device.waitForFirstRun();
            _waitForFirstRun = false;
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

    let messageResponse: MessageResponse;

    try {
        // This function will run inside Device.run() after device will be acquired and initialized
        const inner = async (): Promise<void> => {

            // check if device is in unexpected state (bootloader, not-initialized, old firmware)
            const state: ?string = await checkDeviceState(device, parameters.requiredFirmware);
            if (state) {
                // wait for popup handshake
                await getPopupPromise().promise;
                // show unexpected state information
                postMessage(new UiMessage(state));
                return Promise.resolve();
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

            const trustedHost: boolean = DataManager.getSettings('trustedHost');

            // check and request permissions
            if (_parameters.requiredPermissions.length > 0 && !trustedHost) {
                // show permissions in UI
                const permitted: boolean = await requestPermissions(_parameters.requiredPermissions, callbacks);
                if (!permitted) {
                    postMessage(new ResponseMessage(_parameters.responseID, false, { error: ERROR.PERMISSIONS_NOT_GRANTED.message } ));
                    closePopup();
                    return Promise.resolve();
                }
            }

            // before authentication, ask for confirmation if needed [export xpub, sign message]
            if (typeof _parameters.confirmation === 'function' && !trustedHost) {
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
            try {
                let response: Object = await _parameters.method.apply(this, [ parameters, callbacks ]);
                messageResponse = new ResponseMessage(_parameters.responseID, true, response);
                //postMessage(new ResponseMessage(_parameters.responseID, true, response));
            } catch (error) {
                if (error.custom) {
                    delete error.custom;
                    postMessage(new ResponseMessage(_parameters.responseID, false, error));
                } else {
                    postMessage(new ResponseMessage(_parameters.responseID, false, { error: error.message } ));
                }

                //device.release();
                device.removeAllListeners();
                cleanup();

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
        console.warn("FINALLL", messageResponse);
        device.release();
        device.removeAllListeners();
        cleanup();

        if (messageResponse) {
            postMessage(messageResponse);
        }
    }
}

/**
 * Clean up all variables and references.
 * @returns {void}
 * @memberof Core
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
 * @memberof Core
 */
const closePopup = (): void => {
    postMessage(new UiMessage(UI.CLOSE_UI_WINDOW));
}


/**
 * Handle button request from Device.
 * @param {string} code
 * @returns {Promise<void>}
 * @memberof Core
 */
const onDeviceButtonHandler = async (code: string): Promise<void> => {
    postMessage(new DeviceMessage(DEVICE.BUTTON, code));
    postMessage(new UiMessage(UI.REQUEST_BUTTON, code));
}

/**
 * Handle pin request from Device.
 * @param {string} type
 * @param {Function} callback // TODO: add params
 * @returns {Promise<void>}
 * @memberof Core
 */
const onDevicePinHandler = async (type: string, callback: (error: any, success: any) => void): Promise<void> => {
    // request pin view
    postMessage(new UiMessage(UI.REQUEST_PIN));
    // wait for pin
    let uiResp: UiPromiseResponse = await getUiPromise().promise;
    const pin: string = uiResp.data;
    callback.apply(null, [null, pin]);
}

/**
 * Handle pin request from Device.
 * @param {Function} callback // TODO: add params
 * @returns {Promise<void>}
 * @memberof Core
 */
const onDevicePassphraseHandler = async (callback: (error: any, success: any) => void): Promise<void> => {
    // request passphrase view
    postMessage(new UiMessage(UI.REQUEST_PASSPHRASE));
    // wait for passphrase
    let uiResp: UiPromiseResponse = await getUiPromise().promise;
    const pass: string = uiResp.data.value;
    const save: boolean = uiResp.data.save;
    DataManager.isPassphraseCached(save);
    callback.apply(null, [null, pass]);
}

/**
 * Handle popup closed by user.
 * @returns {void}
 * @memberof Core
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
 * @memberof Core
 */
const handleDeviceSelectionChanges = (): void => {
    if (_uiPromise && _deviceList) {
        // add new connected device to list
        let list: Array<Object> = _deviceList.asArray();
        if (list.length === 1) {
            // there is only one device, use it
            _uiPromise.resolve({ event: 'device_connected', data: list[0].path } );
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
 * @memberof Core
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
            postMessage(new DeviceMessage(DEVICE.CONNECT_UNACQUIRED, device));
        });

        _deviceList.on(DEVICE.DISCONNECT, (device: DeviceDescription) => {
            handleDeviceSelectionChanges();
            postMessage(new DeviceMessage(DEVICE.DISCONNECT, device));
        });

        _deviceList.on(DEVICE.DISCONNECT_UNACQUIRED, (device: DeviceDescription) => {
            postMessage(new DeviceMessage(DEVICE.DISCONNECT_UNACQUIRED, device));
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
 * An event emitter for communication with parent. entrypoint/library.js
 * @extends EventEmitter
 * @memberof Core
 */
export class Core extends EventEmitter {
    constructor() {
        super();
    }
    handleMessage(message: Object): void {
        handleMessage(message);
    }
}

/**
 * Init instance of Core event emitter.
 * @returns {Core}
 * @memberof Core
 */
const initCore = (): Core => {
    _core = new Core();
    return _core;
}

/**
 * Module initialization.
 * This will download the config.json, start DeviceList, init Core emitter instance.
 * Returns Core, an event emitter instance.
 * @param {Object} settings - optional // TODO
 * @returns {Promise<Core>}
 * @memberof Core
 */
export const init = async (settings: ConnectSettings): Promise<Core> => {
    try {
        await initCore();
        await DataManager.load(settings);
        await initDeviceList();
        return _core;
    } catch(error) {
        // TODO: kill app
        //postMessage(new IframeMessage(IFRAME.ERROR));
        logger.error("Init error", error);
        throw error;
    }
}
