/* @flow */
'use strict';

/**
 * (C) 2017 SatoshiLabs
 * TODO: description
 * GPLv3
 */

import TrezorBase, { eventEmitter } from '../index';

import * as POPUP from '../constants/popup';
import * as IFRAME from '../constants/iframe';
import * as UI from '../constants/ui';
import * as DEVICE from '../constants/device';

import { NO_IFRAME, IFRAME_INITIALIZED, DEVICE_CALL_IN_PROGRESS, IFRAME_TIMEOUT } from '../constants/errors';
import PopupManager from '../popup/PopupManager';
import Log from '../utils/debug';
import css from '../iframe/inline-styles';

import { create as createDeferred } from '../utils/deferred';
import type { Deferred } from '../utils/deferred';

import { parseMessage, UiMessage, UI_EVENT, DEVICE_EVENT, RESPONSE_EVENT } from '../core/CoreMessage';
import type { CoreMessage } from '../core/CoreMessage';

import { parse as parseSettings, validate as validateSettings, setDataAttributes } from './ConnectSettings';
import type { ConnectSettings } from './ConnectSettings';

let _log: Log = new Log("[index.js]", true);
let _settings: ConnectSettings;
let _popupManager: PopupManager;
let _iframe: HTMLIFrameElement;
let _iframeOrigin: string;
let _iframeHandshakePromise: ?Deferred<void>;
let _messageID: number = 0;

// every postMessage to iframe has its own promise to resolve
let _messagePromises: { [key: number]: Deferred<void> } = {};

const initIframe = async (settings: Object): Promise<void> => {

    let existedFrame: HTMLIFrameElement = (document.getElementById('trezorconnect') : any);
    if (existedFrame) {
        _iframe = existedFrame;
    } else {
        _iframe = document.createElement('iframe');
        _iframe.frameBorder = '0';
        _iframe.width = '0px';
        _iframe.height = '0px';
        _iframe.style.position = 'absolute';
        _iframe.style.display = 'none';
        _iframe.id = 'trezorconnect';
    }

    setDataAttributes(_iframe, settings);

    _settings = parseSettings(settings);
    _popupManager = initPopupManager();

    //let src: string =  window.location.hostname === 'localhost' ? 'iframe.html' : 'https://dev.trezor.io/experiments/iframe.html';
    //const src: string = `${settings.iframeSrc}?settings=${ encodeURI( JSON.stringify(settings) ) }`;
    const src: string = `${_settings.iframe_src}?${ Date.now() }`;
    _iframe.setAttribute('src', src);



    if (document.body)
        document.body.appendChild(_iframe);

    let iframeSrcHost: ?Array<string> = _iframe.src.match(/^.+\:\/\/[^\‌​/]+/);
    if (iframeSrcHost && iframeSrcHost.length > 0)
        _iframeOrigin = iframeSrcHost[0];

    _iframeHandshakePromise = createDeferred();
    return _iframeHandshakePromise.promise;
}

const injectStyleSheet = (): void => {
    const doc: Document = _iframe.ownerDocument;
    const head: HTMLElement = doc.head || doc.getElementsByTagName('head')[0];
    const style: HTMLStyleElement = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('id', 'TrezorjsStylesheet');


    if (style.styleSheet) { // IE
        // $FlowIssue
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }
    head.append(style);
}

const initPopupManager = (): PopupManager => {
    const pm: PopupManager = new PopupManager(_settings.popup_src);
    pm.on(POPUP.CLOSED, () => {
        postMessage({ type: POPUP.CLOSED }, false);
    });
    return pm;
}


// post messages to iframe
const postMessage = (message: any, usePromise:boolean = true): ?Promise<void> => {
    _messageID++;
    message.id = _messageID;
    _iframe.contentWindow.postMessage(message, '*');

    if (usePromise) {
        _messagePromises[_messageID] = createDeferred();
        return _messagePromises[_messageID].promise;
    }
    return null;
}

// handle message received from iframe
const handleMessage = (messageEvent: MessageEvent): void => {
    // ignore messages from domain other then iframe origin
    if (messageEvent.origin !== _iframeOrigin) return;

    const message: CoreMessage = parseMessage(messageEvent.data);
    // TODO: destructuring with type
    // https://github.com/Microsoft/TypeScript/issues/240
    //const { id, event, type, data, error }: CoreMessage = message;
    const id: number = message.id || 0;
    const event: string = message.event;
    const type: string = message.type;
    const data: any = message.data;
    const error: any = message.error;

    _log.log("handleMessage", message)

    switch (event) {

        case RESPONSE_EVENT :
            if (_messagePromises[id]) {
                _messagePromises[id].resolve(data);
                delete _messagePromises[id];
            } else {
                console.warn(`Unknown message id ${id}`);
            }
        break;

        case DEVICE_EVENT :
            // pass DEVICE event up to html
            eventEmitter.emit(event, message);
            eventEmitter.emit(type, data); // DEVICE_EVENT also emit single events (connect/disconnect...)
        break;

        case UI_EVENT :
            // pass UI event up
            eventEmitter.emit(event, data);
            if (type === IFRAME.HANDSHAKE) {
                if (_iframeHandshakePromise)
                    _iframeHandshakePromise.resolve();
                _iframeHandshakePromise = null;
                injectStyleSheet();
            } else if (type === POPUP.CANCEL_POPUP_REQUEST) {
                _popupManager.cancel();
            } else if (type === UI.CLOSE_UI_WINDOW) {
                _popupManager.close();
            } else {
                _popupManager.postMessage( new UiMessage(type, data) );
            }
        break;

        default:
            console.warn("Undefined message", event, messageEvent)
    }
}


export default class TrezorConnect extends TrezorBase {

    // static on(type: string, fn: Function): void {
    //     eventEmitter.on(type, fn);
    // }

    // static off(type: string, fn: Function): void {
    //     eventEmitter.removeListener(type, fn);
    // }

    static async init(settings: Object = {}): Promise<void> {

        if(_iframe)
            throw IFRAME_INITIALIZED;

        // TODO: check browser support

        window.addEventListener('message', handleMessage);
        const iframeTimeout = window.setTimeout(() => {
            throw IFRAME_TIMEOUT;
        }, 10000);
        await initIframe(settings);



        window.clearTimeout(iframeTimeout);

        window.onbeforeunload = () => {
            _popupManager.onbeforeunload();
        }
    }

    static changeSettings(settings: Object) {
        postMessage({ type: UI.CHANGE_SETTINGS, data: parseSettings(settings) }, false);
    }

    static async __call(params: Object): Promise<Object> {
        if (_iframeHandshakePromise) {
            return { success: false, message: NO_IFRAME.message };
            //return new ResponseMessage();
        }

        // request popup. it might be used in the future
        _popupManager.request(params);

        // post message to iframe
        try {
            const response: ?Object = await postMessage({ type: IFRAME.CALL, data: params });
            if (response) {
                // TODO: unlock popupManager request only if there wasn't error "in progress"
                if (response.error !== DEVICE_CALL_IN_PROGRESS.message)
                    _popupManager.unlock();
                return response;
            } else {
                _popupManager.unlock();
                // TODO
                return { success: false }
            }
        } catch(error) {
            console.log("Call error", error)
            return error;
        }
    }

    static dispose(): void {
        // TODO
    }

    static getVersion(): Object {
        return {
            type: 'connect'
        }
    }

}

// auto init
let scripts: HTMLCollection<HTMLScriptElement> = document.getElementsByTagName('script');
let index: number = scripts.length - 1;
let myself: HTMLScriptElement = scripts[index];
let queryString: string = myself.src.replace(/^[^\?]+\??/,'');

if (queryString === 'init') {
    TrezorConnect.init();
}

window.TrezorConnect = TrezorConnect;

export {
    UI,
    DEVICE,
    UI_EVENT,
    DEVICE_EVENT,
    RESPONSE_EVENT,
}
