import EventEmitter from 'events';
import MessagePromise from '../message/MessagePromise';
import PopupMessage, { POPUP_REQUEST_PIN, POPUP_REQUEST_PASSPHRASE, POPUP_INVALID_PIN } from '../message/PopupMessage';

const POPUP_WIDTH: Number = 600;
const POPUP_HEIGHT: Number = 500;
const POPUP_REQUEST_TIMEOUT: Number = 500;
const POPUP_CLOSE_INTERVAL: Number = 500;
const POPUP_OPEN_TIMEOUT: Number = 2000;
const settings = {
    popupURL1: 'https://dev.trezor.io/experiments/popup.html',
    popupURL: 'popup.html'
}

export default class PopupManager extends EventEmitter {

    constructor() {
        super();
        // bind methods
        this.open = this.open.bind(this);
        // popup request
        // TODO: ie - open imediately but handshake after timeout
        this.requestTimeout = window.setTimeout(() => {
            this.open();
            //this.setAddress(settings.popupURL);
        }, POPUP_REQUEST_TIMEOUT);
        //this.open();
    }

    setAddress(url: string):void {
        this.win.location = url;
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

        this.win = window.open(settings.popupURL, '_blank', opts);

        this.closeInterval = window.setInterval(() => {
            if (this.win && this.win.closed) {
                window.clearInterval(this.closeInterval);
                this.emit('closed');
            }
        }, POPUP_CLOSE_INTERVAL);

        this.openTimeout = window.setTimeout( () => {
            if( !(this.win && !this.win.closed) ) {
                this.promise.reject('Popup timeout!')
            }
        }, POPUP_OPEN_TIMEOUT);

        this.requestTimeout = null;
    }

    close(): void {
        if(this.requestTimeout) {
            window.clearTimeout(this.requestTimeout);
            this.requestTimeout = null;
        }
        if(this.openTimeout){
            window.clearTimeout(this.openTimeout);
            this.openTimeout = null;
        }
        if(this.win)
            this.win.close();
    }

    postMessage(message: PopupMessage, origin: Object): void {
        this.win.postMessage(message, origin);
    }
}
