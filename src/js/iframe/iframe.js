import * as DeviceError from '../errors/DeviceError';
import { ConnectedDevice, getDeviceList, acquireFirstDevice, acquireDevice, getAcquiredDevice } from '../device/DeviceManager';
import PopupMessage, {
    POPUP_LOG,
    POPUP_HANDSHAKE,
    POPUP_CLOSE,
    POPUP_CLOSED,
    POPUP_REQUEST_PIN,
    POPUP_RECEIVE_PIN,
    POPUP_INVALID_PIN,
    POPUP_REQUEST_PASSPHRASE,
    POPUP_RECEIVE_PASSPHRASE,
    POPUP_CONNECT
} from '../message/PopupMessage';
import IframeMessage, { IFRAME_HANDSHAKE, IFRAME_CANCEL_POPUP_REQUEST, IFRAME_ERROR } from '../message/IframeMessage';
import MessagePromise from '../message/MessagePromise';

import { errorHandler, resolveAfter, NO_CONNECTED_DEVICES } from '../utils/promiseUtils';
import { getPathFromIndex } from '../utils/pathUtils';


var _deviceList: DeviceList;
var _callParams: Object;
var _popupPromise: MessagePromise = false;

const onMessage = (event: MessageEvent):void => {
    // first message is received from tunnel.js idk. why...
    // ignore message from myself
    if(event.source === window) return;

    console.log("[iframe.js]", "onMessage", event, POPUP_CLOSED)

    // prevent from pass it up
    event.preventDefault();
    event.stopImmediatePropagation();

    switch(event.data.type) {
        // communication with popup
        case POPUP_LOG :
            let args = JSON.parse(event.data.args)
            console[event.data.level].apply(this, args);
        break;
        case POPUP_HANDSHAKE :
            if (!_popupPromise) _popupPromise = new MessagePromise();
            initSessionFromPopup();
        break;

        case POPUP_RECEIVE_PIN :
            _devicePinCallback.apply(null, [null, event.data.message]);
        break;
        case POPUP_RECEIVE_PASSPHRASE:
            _devicePassphraseCallback.apply(null, [null, event.data.message]);
        break;

        // communication with parent
        case POPUP_CLOSED :
            _popupPromise.reject(DeviceError.POPUP_CLOSED);
            _popupPromise = null;
            _deviceList.onbeforeunload(true);
            // release all device sessions
            // clear all references to popup
            // reject all promises
        break;
        case 'call':
            _callParams = event.data;
            onCall(event)
            .catch(error => {
                postMessage({ type: IFRAME_ERROR, error: error.message }, event);
            })
        break;
    }
};

const onCall = async (event): any => {

    if (!_deviceList) {
        postMessage({ type: IFRAME_CANCEL_POPUP_REQUEST });
        throw DeviceError.NO_TRANSPORT;
    }

    // try to request device before popup show up
    let device = await initSession(event);
    if (device === null) {
        // wait for popup handshake @see: initSessionFromPopup
        if (!_popupPromise) _popupPromise = new MessagePromise();
        // wait for popup successfull pin/login
        try {
            device = await _popupPromise.getPromise();
        } catch (error) {
            closePopup();
            throw error;
        }
        closePopup();
    }

    // TODO: check if device is currently in use (process interruption)

    let index = Math.floor(Math.random() * (9 - 0 + 1)) + 0;
    let path = getPathFromIndex(index);

    let node = await device.getNode(path);
    await resolveAfter(500, null);
    device.release();

    postMessage({ type: 'response', randIndex: index, index: node.index }, event);
}

// session default request attempt
const initSession = async (event): ConnectedDevice => {

    console.log("initSesssion", _popupPromise)
    try {
        if (_popupPromise) return null;
        // reject if empty
        const device: ConnectedDevice = await acquireFirstDevice(_deviceList, true);
        //console.log("initSesssion", _popupPromise)
        //const device: ConnectedDevice = await acquireDevice(_deviceList, _callParams.selectedDevice, true);
        if (_popupPromise) return null;
        // popup is still not open
        const feat = device.features;
        const pin = feat.pin_protection ? feat.pin_cached : true;
        let pass = feat.passphrase_protection ? feat.passphrase_cached : true;
        if (device.device.rememberedPlaintextPasshprase != null) pass = true;
        if (pin && pass) {
            // ready to use, no need to open popup
            postMessage({ type: IFRAME_CANCEL_POPUP_REQUEST });
            return device;
        }
    } catch (error) {
        // dont throw anything, wait for popup
        console.warn("initSession", error);
    }
    // wait for popup
    return null;
}


// popup session request
const initSessionFromPopup = async (): boolean => {
    try {
        console.log("init from popup")
        // check if device was succesfully requested in initSession()
        let device: ConnectedDevice = await getAcquiredDevice(_deviceList);
        //let device: ConnectedDevice = null;
        // otherwise try to request device
        if (device === null) {
            console.log("----+++++ initSessionFromPopup111")
            device = await acquireFirstDevice(_deviceList, true);
            //device = await acquireDevice(_deviceList, _callParams.selectedDevice, true);
        }
        console.log("++++initSessionFromPopup", device)
        device.session.once('pin', onDevicePinHandler);
        device.device.once('passphrase', onDevicePassphraseHandler);
        //device.session.once('passphrase', _popup.onPassphraseHandler);

        // force device to show pin and passphrase
        let path = getPathFromIndex(0);
        console.log("++++initSessionFromPopup111", device)
        const result = await device.getNode(path);
        console.log("++++initSessionFromPopup222", device)
        // resolve promise given by PopupManager.open()
        // and allow app to continue (onMessage: 'call')
        _popupPromise.resolve(device);
        return true;
    } catch(error) {
        console.warn("initSessionFromPopup", error)
        if (!_popupPromise) {
            // consume error
            return false;
        }
        if (error.code !== undefined) {
            switch (error.code) {
                case DeviceError.FAILURE_INVALID_PIN :
                    postMessage( new PopupMessage(POPUP_INVALID_PIN) );
                    initSessionFromPopup();
                break;
            }
        } else {
            if (error === DeviceError.DEVICE_NOT_CONNECTED) {
                postMessage( new PopupMessage(POPUP_CONNECT) );
                await resolveAfter(300, null);
                initSessionFromPopup();
            } else {
                _popupPromise.reject(error);
            }
        }
    }

    return false;
}

var _devicePinCallback: Function;
const onDevicePinHandler = (type: string, callback: Function) => {
    console.log("onDevicePinHandler");
    _devicePinCallback = callback;
    postMessage( new PopupMessage(POPUP_REQUEST_PIN) );
}

var _devicePassphraseCallback: Function;
const onDevicePassphraseHandler = (callback: Function) => {
    _devicePassphraseCallback = callback;
    postMessage( new PopupMessage(POPUP_REQUEST_PASSPHRASE) );
}

const closePopup = ():void => {
    // if(!_popup) return;
    // // clear reference
    // _popup.dispose();
    // _popup.close();
    _popupPromise = null;
    postMessage({ type: POPUP_CLOSE });
}

// communication with parent window
const postMessage = (message, event) => {
    if (!window.top) {
        console.error('Cannot reach window.top');
        return;
    }
    let origin = (event && event.origin !== 'null') ? event.origin : '*';
    console.log("[tunnel.js]", "postMessage", message, origin);
    window.top.postMessage(message, origin);
}

// init
window.addEventListener('load', () => {
    window.addEventListener('message', onMessage, false);
    initDeviceList();
    postMessage(new IframeMessage(IFRAME_HANDSHAKE));
}, false);

// dispose
// window.addEventListener('beforeunload', event => {
//     alert("DISP!")
//     return true;
// });

// on load init,
// if device was used set back variables
const initDeviceList = async (): boolean => {
    try {
        _deviceList = await getDeviceList();
        _deviceList.on('connect', device => {
            let label = device.features.label !== "" ? device.features.label : "My TREZOR";
            postMessage(new IframeMessage('DEVICE_EVENT', {
                eventType: 'connect',
                eventMessage: { id: device.features.device_id, label: label }
            }));
        })
        _deviceList.on('disconnect', device => {
            let label = device.features.label !== "" ? device.features.label : "My TREZOR";
            postMessage(new IframeMessage('DEVICE_EVENT', {
                eventType: 'disconnect',
                eventMessage: { id: device.features.device_id, label: label }
            } ));
        });

        _deviceList.on('released', device => {
            postMessage(new IframeMessage('DEVICE_EVENT', { eventType: 'released' } ));
        });
        _deviceList.on('acquired', device => {
            postMessage(new IframeMessage('DEVICE_EVENT', { eventType: 'acquired' } ));
        });

        _deviceList.on('error', error => {
            _deviceList = null;
            resolveAfter(1000, null).then(() => { initDeviceList() });
            postMessage(new IframeMessage('DEVICE_EVENT', { eventType: 'error', eventMessage: error.message || error } ));
        });
        return true;
    } catch (error) {
        _deviceList = null;
        resolveAfter(1000, null).then(() => { initDeviceList() } );
        postMessage(new IframeMessage('DEVICE_EVENT', { eventType: 'error', eventMessage: error.message || error } ));
    }
    return false;
}
