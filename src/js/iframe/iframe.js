import { ConnectedDevice, getDeviceList, acquireFirstDevice, stealDevice, getRequestedDevice } from '../device/DeviceManager';
import PopupManager from './PopupManager';
import PopupMessage, { POPUP_LOG, POPUP_HANDSHAKE, POPUP_RECEIVE_PIN, POPUP_RECEIVE_PASS } from '../popup/PopupMessage';
import IframeMessage, { IFRAME_HANDSHAKE, IFRAME_CANCEL_POPUP_REQUEST, IFRAME_ERROR, POPUP_CLOSED } from './IframeMessage';

import { errorHandler, resolveAfter, NO_CONNECTED_DEVICES } from '../utils/promiseUtils';
import { getPathFromIndex } from '../utils/pathUtils';


var _deviceList: DeviceList;
var _popup: PopupManager;

// override window open method (Firefox bug with window.open inside iframe)
var _windowOpen:Function = window.open;
window.open = (url, name, features) => {
    console.log("Window open!");
    if(!_popup) _popup = new PopupManager();
    _popup.on('closed', () => {
        _deviceList.onbeforeunload(true);
        if(_popup) {
            _popup.removeAllListeners();
            _popup.reject(new Error('Popup closed'));
        }
    });
    // trigger popup handshake
    _popup.open(_windowOpen);
};

function onMessage(event: MessageEvent){
    // first message is received from tunnel.js idk. why...
    // ignore message from myself
    if(event.source === window) return;

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
            initSessionFromPopup();
        break;
        case POPUP_RECEIVE_PIN :
            _popup.onPinCallback(null, event.data.message);
        break;
        case POPUP_RECEIVE_PASS:
            _popup.onPassCallback("a");
        break;

        // communication with parent
        case 'call':
            onCall(event);
        break;
    }
};

const onCall = async (event): any => {
    // try to request device before popup show up
    let device = await initSession(event);

    if (device === null) {
        // wait for popup handshake @see: initSessionFromPopup
        if(!_popup) _popup = new PopupManager();
        // wait for popup successfull pin/login
        try {
            device = await _popup.getPromise();
        } catch (error) {
            console.log("oncall resolved!", device);
            //closePopup();
            throw error;
        }
        closePopup();

        //console.log("popup promise resolved!", device);

    }

    // TODO: check if device is currently in use (process interruption)

    let index = Math.floor(Math.random() * (9 - 0 + 1)) + 0;
    let path = getPathFromIndex(index);
    let node = await device.getNode(path);
    await resolveAfter(500, null);

    postMessage({ type: 'resp', randIndex: index, index: node.index }, event);
    device.release();
}

// session default request attempt
const initSession = async (event): ConnectedDevice => {
    try {

        // reject if empty
        const device: ConnectedDevice = await acquireFirstDevice(_deviceList, true);
        // const device: ConnectedDevice = await stealDevice(_deviceList);
        if (_popup && _popup.isOpened()) return null;
        // popup is still not open
        const feat = device.features;
        const pin = feat.pin_protection ? feat.pin_cached : true;
        const pass = feat.passphrase_protection ? feat.passphrase_cached : true;
        if (pin && pass) {
            // ready to use, no need to open popup
            postMessage({ type: IFRAME_CANCEL_POPUP_REQUEST });
            return device;
        }
    } catch (error) {
        // dont throw anything, wait for popup
        console.debug("initSession", error);
    }
    // wait for popup
    return null;
}


// popup session request
const initSessionFromPopup = async (): boolean => {

    try {
        // check if device was succesfully requested in initSession()
        let device: ConnectedDevice = getRequestedDevice(_deviceList);
        // otherwise try to request device
        if (device === null) {
            console.log("Acuaire1", device)
            device = await acquireFirstDevice(_deviceList);
            console.log("Acuaire2", device)
        }
        device.session.on('pin', _popup.onPinHandler);

        // force device to show pin and passphrase
        let path = getPathFromIndex(0);
        const result = await device.getNode(path);
        console.log("getNode");
        // resolve promise given by PopupManager.open()
        // and allow app to continue (onMessage: 'call')
        _popup.resolve(device);
        return true;
    } catch (error) {
        console.error("onPopupHandshake", error);
        _popup.reject(error);
    }
    return false;
}



async function releaseSession() {

}


function disposeDevice() {
    console.log("dispose device!!!!!")
    //_device.session.removeListener('pin', onDevicePinHandler);
    // _device.device.removeListener('disconnect');
    // _device.device.removeListener('changedSessions');
    // _device.device.removeListener('stolen');

    console.log("dispose device!!!!!", _device)
}

const closePopup = ():void => {
    if(!_popup) return;
    // clear reference
    _popup.removeAllListeners();
    _popup.close();
    _popup = null;
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
            postMessage(new IframeMessage('DEVICE_EVENT', {
                eventType: 'connect',
                eventMessage: { id: device.features.device_id }
            }));
        })
        _deviceList.on('disconnect', device => {
            console.log(device)
            postMessage(new IframeMessage('DEVICE_EVENT', { eventType: 'disconnect' } ));
        });

        _deviceList.on('released', () => {
            postMessage(new IframeMessage('DEVICE_EVENT', { eventType: 'released' } ));
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
