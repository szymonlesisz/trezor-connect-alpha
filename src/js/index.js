// @flow
'use strict';

/**
 * (C) 2017 SatoshiLabs
 * TODO: description
 * GPLv3
 */

import EventEmitter from 'events';
import Browser from './utils/Browser';
import PopupMessage, { POPUP_CLOSE, POPUP_CLOSED, POPUP_CONNECT, POPUP_REQUEST_PIN, POPUP_INVALID_PIN, POPUP_REQUEST_PASSPHRASE } from './message/PopupMessage';
import IframeMessage, { IFRAME_HANDSHAKE, IFRAME_CANCEL_POPUP_REQUEST, IFRAME_ERROR } from './message/IframeMessage';
import MessagePromise from './message/MessagePromise';
import PopupManager from './popup/PopupManager';

var _iframe: HTMLElement;
var _popupManager: PopupManager;
var _promise: MessagePromise;

const initIframe = async () => {
    _iframe = document.createElement('iframe');
    _iframe.frameBorder = 0;
    _iframe.width = '0px';
    _iframe.height = '0px';
    _iframe.style.position = 'absolute';
    _iframe.style.display = 'none';
    _iframe.id = 'randomid'; // TODO:
    //_iframe.setAttribute('src', 'https://dev.trezor.io/experiments/iframe.html');
    //_iframe.setAttribute('src', 'https://dev.trezor.io/experiments/iframe.html?rand=' + (new Date()).getTime() + Math.floor(Math.random() * 1000000));
    _iframe.setAttribute('src', 'iframe.html');
    document.body.appendChild(_iframe);

    _promise = new MessagePromise('iframe');
    return _promise.getPromise();
}

const popupRequest = (): void => {
    cancelPopupRequest();
    _popupManager = new PopupManager();
    _popupManager.on('closed', () => {
        _popupManager.close();
        _popupManager = null;
        postMessage({ type: POPUP_CLOSED }, false);
    });
}

const cancelPopupRequest = (): void => {
    if (_popupManager) {
        _popupManager.close();
        _popupManager = null;
    }
}

const closePopup = ():void => {
    if (_popupManager) {
        _popupManager.removeAllListeners(['closed']);
        _popupManager.close();
        _popupManager = null;
    }
}

const postMessage = (message, usePromise:boolean = true): Promise<any> => {
    _iframe.contentWindow.postMessage(message, '*');
    if (usePromise) {
        _promise = new MessagePromise();
        return _promise.getPromise();
    }
    return null;
}

const onMessage = event => {
    console.log("[index.js]", "onMessage", event.data)
    const { type, message, error } = event.data;
    switch(type) {
        case IFRAME_HANDSHAKE :
            _promise.resolve(true);
            _promise = null;
        break;
        case IFRAME_ERROR :
            _promise.resolve({ success: false, error: error });
            _promise = null;
        break;
        case IFRAME_CANCEL_POPUP_REQUEST :
            cancelPopupRequest();
        break;
        case 'DEVICE_EVENT' :
            eventEmitter.emit(message.eventType, message.eventMessage);
        break;
        case POPUP_CONNECT :
        case POPUP_REQUEST_PIN :
        case POPUP_INVALID_PIN :
        case POPUP_REQUEST_PASSPHRASE :
            _popupManager.postMessage( new PopupMessage(type, message), event.origin );
        break;
        case POPUP_CLOSE :
            closePopup();
        break;
        default :
            _promise.resolve(event.data);
            _promise = null;
    }
}

const eventEmitter: EventEmitter = new EventEmitter();

class Trezor extends EventEmitter {

    constructor() {
        super();
    }

    static on(type: string, method: Function): void {
        eventEmitter.on(type, method);
    }

    static off(type: string, method: Fuction): void {
        eventEmitter.off(type, method);
    }

    static async init(): void {
        if(_iframe)
            throw new Error('Trezor.js already initialized');

        window.addEventListener('message', onMessage);
        const iframeTimeout = window.setTimeout(() => {
            console.error("iframe handshake timeout!");
        }, 10000);
        await initIframe();
        window.clearTimeout(iframeTimeout);
    }

    static async call(params: Object): Promise<Object> {
        if (_promise) {
            if ( _promise.getId() === 'iframe') {
                return { success: false, message: "iframe not initialized yet" };
            } else {
                return { success: false, message: "Previous call is in progress" };
            }
        }
        console.log("CALL", params)
        popupRequest();
        try {
            let r = await postMessage({ type: 'call', ...params });
            return r;
        } catch(error) {
            console.log("Call error", error)
            return error;
        }
        return null;
    }

    static dispose(): void {

    }

}



module.exports = Trezor;

// self init
// window.addEventListener('load', () => {
//     Trezor.init();
// }, false);

// self dispose
// window.addEventListener('beforeunload', event => {
//     var confirmationMessage = "\o/";
//     (event || window.event).returnValue = confirmationMessage; //Gecko + IE
//     return confirmationMessage;                                //Webkit, Safari, Chrome etc.
// });
