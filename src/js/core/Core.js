/* @flow */
'use strict';

import EventEmitter from 'events';
import DataManager from '../data/DataManager';
import DeviceList, { getDeviceList } from '../device/DeviceList';
import Device from '../device/Device';
import type { DeviceDescription } from '../device/Device';

import * as TRANSPORT from '../constants/transport';
import * as DEVICE from '../constants/device';
import * as POPUP from '../constants/popup';
import * as UI from '../constants/ui';
import * as IFRAME from '../constants/iframe';
import * as ERROR from '../constants/errors';

import { UiMessage, DeviceMessage, ResponseMessage } from './CoreMessage';
import type { CoreMessage, UiPromiseResponse } from './CoreMessage';

import { parse as parseParams, parseGeneral as parseGeneralParams } from './methods/parameters';
import type { GeneralParams, MethodParams, MethodCallbacks } from './methods/parameters';
import { requestPermissions } from './methods/permissions';

import { create as createDeferred } from '../utils/deferred';
import type { Deferred } from '../utils/deferred';

import { resolveAfter } from '../utils/promiseUtils'; // TODO: just tmp. remove
import { getPathFromIndex } from '../utils/pathUtils';

import Log, { init as initLog, enable as enableLog } from '../utils/debug';

import { parse as parseSettings } from '../entrypoints/ConnectSettings';
import type { ConnectSettings } from '../entrypoints/ConnectSettings';

// Public variables
let _core: Core;                        // Class with event emitter
let _deviceList: ?DeviceList;           // Instance of DeviceList
let _parameters: ?MethodParams;         // Incoming parsed params
let _popupPromise: ?Deferred<void>;     // Waiting for popup handshake
let _uiPromises: Array<Deferred<UiPromiseResponse>> = [];      // Waiting for ui response
let _waitForFirstRun: boolean = false;  // used in corner-case, where device.isRunning() === true but it isn't loaded yet.
let _callParameters: Array<GeneralParams> = [];

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
    if (requestWindow) { postMessage(new UiMessage(UI.REQUEST_UI_WINDOW)); }
    if (!_popupPromise) { _popupPromise = createDeferred(); }
    return _popupPromise;
};

/**
 * Creates an instance of uiPromise.
 * @returns {Promise<string>}
 * @memberof Core
 */

const findUiPromise = (callId: number, promiseId: string): ?Deferred<UiPromiseResponse> => {
    return _uiPromises.find(p => p.id === promiseId);
}

const createUiPromise = (callId: number, promiseId: string): Deferred<UiPromiseResponse> => {
    const uiPromise: Deferred<UiPromiseResponse> = createDeferred(promiseId);
    _uiPromises.push(uiPromise);
    return uiPromise;
}

const removeUiPromise = (promise: Deferred<UiPromiseResponse>): void => {
    _uiPromises = _uiPromises.filter(p => p !== promise);
}


/**
 * Emit message to listener (parent).
 * @param {CoreMessage} message
 * @returns {void}
 * @memberof Core
 */
const postMessage = (message: CoreMessage): void => {
    _core.emit(CORE_EVENT, message);
};

/**
 * Handle incoming message.
 * @param {Object} data
 * @returns {void}
 * @memberof Core
 */
export const handleMessage = (message: CoreMessage): void => {
    console.log('handle message in core', message);
    switch (message.type) {

        case POPUP.HANDSHAKE :
            getPopupPromise(false).resolve();
            break;
        case POPUP.CLOSED :
            onPopupClosed();
            break;

        case UI.CHANGE_SETTINGS :
            enableLog(parseSettings(message.data).debug);
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
            const uiPromise: ?Deferred<UiPromiseResponse> = findUiPromise(0, message.type);
            if (uiPromise) {
                uiPromise.resolve({ event: message.type, data: message.data });
                removeUiPromise(uiPromise);
            }
            break;

        // message from index
        case IFRAME.CALL :
            onCall(message).catch(error => {
                logger.debug('onCall error', error);
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
const initDevice = async (parameters: GeneralParams): Promise<Device> => {
    if (!_deviceList) {
        throw ERROR.NO_TRANSPORT;
    }

    let device: ?Device;
    if (parameters.deviceHID) {
        device = _deviceList.getDevice(parameters.deviceHID);
    } else {
        let devicesCount: number = _deviceList.length();
        let selectedDevicePath: string;
        if (devicesCount === 1) {
            // there is only one device available. use it
            selectedDevicePath = _deviceList.getFirstDevicePath();
            device = _deviceList.getDevice(selectedDevicePath);
        } else {
            // no devices available

            // initialize uiPromise instance which will catch changes in _deviceList (see: handleDeviceSelectionChanges function)
            // but do not wait for resolve yet
            createUiPromise(parameters.responseID, DEVICE.WAIT_FOR_SELECTION);

            // wait for popup handshake
            await getPopupPromise().promise;

            // check again for available devices
            // there is a possible race condition before popup open
            devicesCount = _deviceList.length();
            if (devicesCount === 1) {
                // there is one device available. use it
                selectedDevicePath = _deviceList.getFirstDevicePath();
                device = _deviceList.getDevice(selectedDevicePath);
            } else {
                // request select device view
                postMessage(new UiMessage(UI.SELECT_DEVICE, _deviceList.asArray()));

                // wait for device selection
                const uiPromise: ?Deferred<UiPromiseResponse> = findUiPromise(parameters.responseID, DEVICE.WAIT_FOR_SELECTION);
                if (uiPromise) {
                    const uiResp: UiPromiseResponse = await uiPromise.promise;
                    selectedDevicePath = uiResp.data;
                    device = _deviceList.getDevice(selectedDevicePath);
                }
            }
        }
    }

    if (!device) {
        throw ERROR.DEVICE_NOT_FOUND;
    }
    return device;
};

/**
 * Check device state.
 * @param {Device} device
 * @param {string} requiredFirmware
 * @returns {string|null}
 * @memberof Core
 */
const checkUnexpectedState = (device: Device, requiredFirmware: string): ?string => {
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
};

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
    const path: Array<number> = getPathFromIndex(1, 0, 0);
    const response = await device.getCommands().getPublicKey(path, 'Bitcoin');
};

/**
 * Force authentication by getting public key of first account
 * @param {Device} device
 * @returns {Promise<void>}
 * @memberof Core
 */
const checkDeviceState = async (device: Device, state: ?string): Promise<boolean> => {

    if (!state) return true;

    // wait for popup handshake
    await getPopupPromise().promise;

    // request 0 xpub
    const path: Array<number> = getPathFromIndex(1, 0, 0);
    const response = await device.getCommands().getPublicKey(path, 'Bitcoin');

    console.warn("::::STATE COMPARE:", response.message.xpub, "expected to be:", state)

    return response.message.xpub === state;
};

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

    // parse incoming params

    let parameters: MethodParams;
    try {
        parameters = parseParams(message);
    } catch (error) {
        postMessage(new UiMessage(POPUP.CANCEL_POPUP_REQUEST));
        postMessage(new ResponseMessage(responseID, false, { error: ERROR.INVALID_PARAMETERS.message + ': ' + error.message }));
        throw ERROR.INVALID_PARAMETERS;
    }

    const gParameters: GeneralParams = parseGeneralParams(message, parameters);
    _callParameters[responseID] = gParameters;

    // if method is using device (there could be just calls to backend or hd-wallet)
    if (!parameters.useDevice) {
        // TODO: call function and handle interruptions
        //const response: Object = await _parameters.method.apply(this, [ parameters, callbacks ]);
        //messageResponse = new ResponseMessage(_parameters.responseID, true, response);
    }

    // find device
    let device: Device;
    try {
        device = await initDevice(gParameters);
    } catch (error) {
        if (error === ERROR.NO_TRANSPORT) {
            // wait for popup handshake
            await getPopupPromise().promise;
            // show message about transport
            postMessage(new UiMessage(UI.TRANSPORT));
        } else {
            postMessage(new UiMessage(POPUP.CANCEL_POPUP_REQUEST));
        }
        postMessage(new ResponseMessage(responseID, false, { error: error.message }));
        throw error;
    }

    // TODO: nicer
    device.setInstance(gParameters.deviceInstance);

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
            postMessage(new ResponseMessage(responseID, false, { error: ERROR.DEVICE_CALL_IN_PROGRESS.message }));
            throw ERROR.DEVICE_CALL_IN_PROGRESS;
        }
    }

    // device is available
    // set public variables, listeners and run method
    device.on(DEVICE.PIN, onDevicePinHandler);
    device.on(DEVICE.PASSPHRASE, onDevicePassphraseHandler);
    device.on(DEVICE.BUTTON, onDeviceButtonHandler);
    device.on(DEVICE.AUTHENTICATED, () => {
        if (!parameters.useUi) { postMessage(new UiMessage(POPUP.CANCEL_POPUP_REQUEST)); }
    });

    // before acquire session, check if UI will be needed in future
    // and if device is already authenticated
    if (!parameters.useUi && device.isAuthenticated()) {
        // TODO ???
        postMessage(new UiMessage(POPUP.CANCEL_POPUP_REQUEST));
    }

    let messageResponse: ?ResponseMessage;

    try {
        // This function will run inside Device.run() after device will be acquired and initialized
        const inner = async (): Promise<void> => {
            // check if device is in unexpected state (bootloader, not-initialized, old firmware)
            const unexpectedState: ?string = await checkUnexpectedState(device, parameters.requiredFirmware);
            if (unexpectedState) {
                // wait for popup handshake
                await getPopupPromise().promise;
                // show unexpected state information
                postMessage(new UiMessage(unexpectedState));

                device.clearPassphrase();

                // interrupt running process and go to "final" block
                return Promise.resolve();
            }

            // device is ready
            // set parameters as public variable, from now on this is reference to work with
            // this variable will be cleared in cleanup()
            _parameters = parameters;
            _parameters.deviceHID = device.getDevicePath();

            // check if device state is correct (correct checksum)
            const correctState: boolean = await checkDeviceState(device, gParameters.deviceState);
            if (!correctState) {
                // wait for popup handshake
                await getPopupPromise().promise;

                device.clearPassphrase();

                messageResponse = new ResponseMessage(gParameters.responseID, false, { error: 'Device state is incorrect' });
                closePopup();
                // interrupt running process and go to "final" block
                return Promise.resolve();
            }

            // create callbacks collection
            // this will be used inside methods to communicate with Device or UI
            const callbacks: MethodCallbacks = {
                device,
                postMessage,
                getPopupPromise,
                createUiPromise,
                findUiPromise,
                removeUiPromise
            };

            const trustedHost: boolean = DataManager.getSettings('trustedHost');

            // check and request permissions
            if (_parameters.requiredPermissions.length > 0 && !trustedHost) {
                // show permissions in UI
                const permitted: boolean = await requestPermissions(_parameters.requiredPermissions, callbacks);
                if (!permitted) {
                    postMessage(new ResponseMessage(_parameters.responseID, false, { error: ERROR.PERMISSIONS_NOT_GRANTED.message }));
                    closePopup();

                    device.clearPassphrase();

                    return Promise.resolve();
                }
            }

            // before authentication, ask for confirmation if needed [export xpub, sign message]
            if (typeof _parameters.confirmation === 'function' && !trustedHost) {
                // show confirmation in UI
                const confirmed: boolean = await _parameters.confirmation.apply(this, [ _parameters, callbacks ]);
                if (!confirmed) {
                    postMessage(new ResponseMessage(_parameters.responseID, false, { error: 'Cancelled' }));
                    closePopup();

                    device.clearPassphrase();

                    return Promise.resolve();
                }
            }

            if (!device.isAuthenticated()) { // TODO: check if auth is needed (getFeatures)
                try {
                    await requestAuthentication(device);
                } catch (error) {
                    // catch wrong pin
                    if (error.message === ERROR.INVALID_PIN_ERROR_MESSAGE) {
                        postMessage(new UiMessage(UI.INVALID_PIN, { device: device.toMessageObject() }));
                        return inner();
                    } else {
                        postMessage(new ResponseMessage(_parameters.responseID, false, { error: error.message }));
                        closePopup();

                        device.clearPassphrase();

                        return Promise.resolve();
                    }
                }
            }

            // wait for popup handshake
            if (_parameters.useUi) {
                await getPopupPromise().promise;
            }

            // run method
            try {
                const response: Object = await _parameters.method.apply(this, [ parameters, callbacks ]);
                messageResponse = new ResponseMessage(_parameters.responseID, true, response);
                // postMessage(new ResponseMessage(_parameters.responseID, true, response));
            } catch (error) {

                // device.clearPassphrase();

                if (!_parameters) {
                    return Promise.resolve();
                }

                if (error.custom) {
                    delete error.custom;
                    postMessage(new ResponseMessage(_parameters.responseID, false, error));
                } else {
                    postMessage(new ResponseMessage(_parameters.responseID, false, { error: error.message }));
                }

                // device.release();
                device.removeAllListeners();
                closePopup();
                cleanup();

                return Promise.resolve();
            }
            closePopup();
        };
        // run inner function

        await device.run(inner, { keepSession: parameters.keepSession });
    } catch (error) {
        if (parameters) {
            postMessage(new ResponseMessage(parameters.responseID, false, { error: error.message || error }));
        }
    } finally {
        // Work done
        console.warn('FINALLL', messageResponse);
        device.release();
        device.removeAllListeners();
        cleanup();

        if (messageResponse) {
            postMessage(messageResponse);
        }
    }
};

/**
 * Clean up all variables and references.
 * @returns {void}
 * @memberof Core
 */
const cleanup = (): void => {
    // closePopup(); // this causes problem when action is interrupted (example: bootloader mode)
    _popupPromise = null;
    _uiPromises = []; // TODO: remove only promises with params callId
    _parameters = null;
    logger.debug('Cleanup...');
};

/**
 * Force close popup.
 * @returns {void}
 * @memberof Core
 */
const closePopup = (): void => {
    postMessage(new UiMessage(UI.CLOSE_UI_WINDOW));
};

/**
 * Handle button request from Device.
 * @param {string} code
 * @returns {Promise<void>}
 * @memberof Core
 */
const onDeviceButtonHandler = async (device: Device, code: string): Promise<void> => {
    postMessage(new DeviceMessage(DEVICE.BUTTON, { device: device.toMessageObject(), code: code } ));
    postMessage(new UiMessage(UI.REQUEST_BUTTON, { device: device.toMessageObject(), code: code } ));
};

/**
 * Handle pin request from Device.
 * @param {string} type
 * @param {Function} callback // TODO: add params
 * @returns {Promise<void>}
 * @memberof Core
 */
const onDevicePinHandler = async (device: Device, type: string, callback: (error: any, success: any) => void): Promise<void> => {
    // request pin view
    postMessage(new UiMessage(UI.REQUEST_PIN, { device: device.toMessageObject() }));
    // wait for pin
    const uiResp: UiPromiseResponse = await createUiPromise(0, UI.RECEIVE_PIN).promise;
    const pin: string = uiResp.data;
    // callback.apply(null, [null, pin]);
    callback(null, pin);
};

/**
 * Handle pin request from Device.
 * @param {Function} callback // TODO: add params
 * @returns {Promise<void>}
 * @memberof Core
 */
const onDevicePassphraseHandler = async (device: Device, callback: (error: any, success: any) => void): Promise<void> => {
    // request passphrase view
    postMessage(new UiMessage(UI.REQUEST_PASSPHRASE, { device: device.toMessageObject() }));
    // wait for passphrase

    const uiResp: UiPromiseResponse = await createUiPromise(0, UI.RECEIVE_PASSPHRASE).promise;
    console.log("onDevicePassphraseHandler", uiResp)
    const pass: string = uiResp.data.value;
    const save: boolean = uiResp.data.save;
    console.log("onDevicePassphraseHandler", pass, save, callback)
    DataManager.isPassphraseCached(save);
    // callback.apply(null, [null, pass]);
    callback(null, pass);
};

/**
 * Handle popup closed by user.
 * @returns {void}
 * @memberof Core
 */
const onPopupClosed = (): void => {
    if (!_popupPromise) return;

    // Device was already acquired. Try to interrupt running action which will throw error from onCall try/catch block
    if (_deviceList && _parameters && _parameters.deviceHID) {
        const device: Device = _deviceList.getDevice(_parameters.deviceHID);
        if (device && device.isUsedHere()) {
            device.interruptionFromUser(ERROR.POPUP_CLOSED);
        }
    // Waiting for device. Throw error before onCall try/catch block
    } else {
        if (_uiPromises.length > 0) {
            _uiPromises.forEach(p => {
                p.reject(ERROR.POPUP_CLOSED);
            });
            _uiPromises = [];
        }
        _popupPromise.reject(ERROR.POPUP_CLOSED);
        _popupPromise = null;
        cleanup();
    }
};

/**
 * Handle DeviceList changes.
 * If there is uiPromise waiting for device selection update view.
 * Used in initDevice function
 * @returns {void}
 * @memberof Core
 */
const handleDeviceSelectionChanges = (): void => {
    const uiPromise: ?Deferred<UiPromiseResponse> = findUiPromise(0, DEVICE.WAIT_FOR_SELECTION);
    if (uiPromise && _deviceList) {
        const list: Array<Object> = _deviceList.asArray();
        if (list.length === 1) {
            // there is only one device. use it
            // resolve uiPromise to looks like it's a user choice (see: handleMessage function)
            uiPromise.resolve({ event: UI.RECEIVE_DEVICE, data: list[0].path });
            removeUiPromise(uiPromise);
        } else {
            // update device selection list view
            postMessage(new UiMessage(UI.SELECT_DEVICE, list));
        }
    }
};

/**
 * Start DeviceList with listeners.
 * @returns {Promise<void>}
 * @memberof Core
 */
const initDeviceList = async (settings: ConnectSettings): Promise<void> => {
    try {
        _deviceList = await getDeviceList();

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

        _deviceList.on(DEVICE.CHANGED, (device: DeviceDescription) => {
            postMessage(new DeviceMessage(DEVICE.CHANGED, device));
        });

        _deviceList.on(TRANSPORT.ERROR, async (error) => {
            _deviceList = null;
            postMessage(new DeviceMessage(TRANSPORT.ERROR, error.message || error));

            if (settings.transport_reconnect) {
                await resolveAfter(1000, null);
                await initDeviceList(settings);
            }
        });
    } catch (error) {
        _deviceList = null;

        if (!settings.transport_reconnect || !_core) {
            throw error;
        } else {
            postMessage(new DeviceMessage(TRANSPORT.ERROR, error.message || error));
            await resolveAfter(1000, null);

            // reconnect
            await initDeviceList(settings);
        }


    }
};

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
    onBeforeUnload(): void {
        if (_deviceList) {
            _deviceList.onBeforeUnload();
        }
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
};

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
        await DataManager.load(settings);
        await initDeviceList(settings);

        await initCore();
        return _core;
    } catch (error) {
        // TODO: kill app
        // postMessage(new IframeMessage(IFRAME.ERROR));
        logger.error('Init error', error);
        throw error;
    }
};
