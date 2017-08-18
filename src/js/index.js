// @flow
'use strict';

/**
 * (C) 2017 SatoshiLabs
 * TODO: description
 * GPLv3
 */

import EventEmitter from 'events';
import Browser from './utils/Browser';
import IframeMessage, { IFRAME_HANDSHAKE, IFRAME_CANCEL_POPUP_REQUEST, IFRAME_ERROR, POPUP_CLOSED } from './iframe/IframeMessage';
import MessagePromise from './message/MessagePromise';

var _iframe;
var _promise: MessagePromise;

const initIframe = async () => {
    _iframe = document.createElement('iframe');
    _iframe.frameBorder = 0;
    _iframe.width = '0px';
    _iframe.height = '0px';
    _iframe.id = 'randomid'; // TODO:
    _iframe.setAttribute('src', 'iframe.html');
    document.body.appendChild(_iframe);

    _promise = new MessagePromise();
    return _promise.getPromise();
}

var requestPopupTimeout = null;
const requestPopup = (): void => {
    cancelPopupRequest();
    requestPopupTimeout = window.setTimeout(() => {
        _iframe.contentWindow.open();
    }, 500);
}

const requestPopupIE = (): void => {

}

const cancelPopupRequest = (): void => {
    if(requestPopupTimeout) {
        window.clearTimeout(requestPopupTimeout);
        requestPopupTimeout = null;
    }
}

const postMessage = (message): Promise<any> => {
    _iframe.contentWindow.postMessage(message, '*');
    _promise = new MessagePromise();
    return _promise.getPromise();
}

const onMessage = event => {
    console.log("[index.js]", "onMessage", event.data)
    const { type, message } = event.data;
    switch(type) {
        case IFRAME_HANDSHAKE :
            _promise.resolve.call(this, true);
        break;
        case IFRAME_ERROR :
            console.warn(message)
        break;
        case IFRAME_CANCEL_POPUP_REQUEST :
            cancelPopupRequest();
        break;
        case 'DEVICE_EVENT' :
            eventEmitter.emit(message.eventType, message.eventMessage);
        break;
        case POPUP_CLOSED :
            _promise.reject.call(this, new Error("Popup closed!") );
        break;
        default :
            _promise.resolve.call(this, event.data);
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
            console.warn("Handshake timeout!");
            //window.removeEventListener('message', onMessage);
        }, 10000);
        await initIframe();
        window.clearTimeout(iframeTimeout);
    }

    static async call() {
        requestPopup();
        try {
            return await postMessage({ type: 'call' });
        }catch(e){
            console.log("EEE", e)
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
