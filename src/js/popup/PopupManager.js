/* @flow */
'use strict';

import EventEmitter from 'events';
import { CLOSED, OPEN_TIMEOUT } from '../constants/popup';
import { showPopupRequest } from './showPopupRequest';

import type { CoreMessage } from '../core/CoreMessage';

const POPUP_WIDTH: number = 600;
const POPUP_HEIGHT: number = 500;
const POPUP_REQUEST_TIMEOUT: number = 400;
const POPUP_CLOSE_INTERVAL: number = 500;
const POPUP_OPEN_TIMEOUT: number = 2000;

export default class PopupManager extends EventEmitter {

    _window: any; // Window
    src: string;
    locked: boolean;
    requestTimeout: number = 0;
    openTimeout: number;
    closeInterval: number = 0;
    currentMethod: string;

    constructor(src: string) {
        super();
        this.src = src;
        // bind methods
        this.open = this.open.bind(this);
    }

    request(params: Object): void {
        // popup request
        // TODO: ie - open imediately and hide it but post handshake after timeout

        // bring popup window to front
        if (this.locked) {
            if (this._window)
                this._window.focus();
            return;
        }

        if (params && typeof params.method === 'string') {
            this.currentMethod = params.method;
        }

        this.locked = true;
        this.requestTimeout = window.setTimeout(() => {
            this.requestTimeout = 0;
            this.open();
            //this.setAddress(settings.popupURL);
        }, POPUP_REQUEST_TIMEOUT);
        //this.open();
    }

    cancel(): void {
        this.close();
    }

    unlock(): void {
        this.locked = false;
    }

    // workaround for IE. hide window (blur) finally set address and window.focus after timeout
    setAddress(url: string): void {
        this._window.location = url;
    }

    open(): void {
        let left = (window.screen.width - POPUP_WIDTH) / 2,
        top = (window.screen.height - POPUP_HEIGHT) / 2,
        width = POPUP_WIDTH,
        height = POPUP_HEIGHT,
        opts =
            `width=${width}
            ,height=${height}
            ,left=${left}
            ,top=${top}
            ,menubar=no
            ,toolbar=no
            ,location=no
            ,personalbar=no
            ,status=no`;

        this._window = window.open(this.src, '_blank', opts);
        // pass method name before popup is loaded
        this._window.name = this.currentMethod;

        this.closeInterval = window.setInterval(() => {
            if (this._window && this._window.closed) {
                this.close();
                this.emit(CLOSED);
            }
        }, POPUP_CLOSE_INTERVAL);

        this.openTimeout = window.setTimeout( () => {
            if( !(this._window && !this._window.closed) ) {
                console.log("OPEN TIME OUT!!!!");
                this.close();

                showPopupRequest( this.open.bind(this), () => { this.emit(CLOSED); } );
            }
        }, POPUP_OPEN_TIMEOUT);

    }

    close(): void {
        if (this.requestTimeout) {
            window.clearTimeout(this.requestTimeout);
            this.requestTimeout = 0;
        }

        if (this.openTimeout) {
            window.clearTimeout(this.openTimeout);
            this.openTimeout = 0;
        }
        if (this.closeInterval) {
            window.clearInterval(this.closeInterval);
            this.closeInterval = 0;
        }
        if (this._window) {
            this._window.close();
            this._window = null;
        }
    }

    postMessage(message: CoreMessage): void {

        // post message before popup request finalized
        if (this.requestTimeout) {
            return;
        }

        // device needs interaction but there is no popup/ui
        // maybe popup request wasn't handled
        // ignore "ui_request_window" type
        if (!this._window && message.type !== 'ui_request_window' && this.openTimeout) {
            this.close();
            showPopupRequest( this.open.bind(this), () => { this.emit(CLOSED); } );
            console.error("TODO ---- render alert in page!", this.closeInterval, this.openTimeout, this.requestTimeout);
            return;
        }

        // post message to popup window
        if (this._window)
            this._window.postMessage(message, '*');
    }

    onbeforeunload() {
        this.close();
    }
}
