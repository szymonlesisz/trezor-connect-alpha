import EventEmitter from 'events';
import MessagePromise from '../message/MessagePromise';
import PopupMessage, { POPUP_REQUEST_PIN, POPUP_INVALID_PIN, POPUP_REQUEST_PASS } from '../popup/PopupMessage';

const POPUP_WIDTH: Number = 600;
const POPUP_HEIGHT: Number = 500;
const POPUP_CLOSE_INTERVAL: Number = 500;
const POPUP_OPEN_TIMEOUT: Number = 2000;
const settings = {
    popupURL: 'popup.html'
}

export default class PopupManager extends EventEmitter {
    constructor() {
        super();

        this.promise = new MessagePromise();

        this.open = this.open.bind(this);
        this.resolve = this.resolve.bind(this);
        this.onPinHandler = this.onPinHandler.bind(this);
    }

    open(method: Function): void {
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

        console.log("OPEN!!!", this.win, this.closeInterval);

        //this.win = window.open(settings.popupURL, '_blank', opts);
        this.win = method.call(window, settings.popupURL, '_blank', opts);
        this.closeInterval = window.setInterval(() => {
            if (this.win && this.win.closed) {
                window.clearInterval(this.closeInterval);
                console.log("CLOSED!!!")
                this.emit('closed');

            }
        }, POPUP_CLOSE_INTERVAL);

        this.openTimeout = window.setTimeout( () => {
            if( !(this.win && !this.win.closed) ) {
                this.promise.reject('Popup timeout!')
            }
        }, POPUP_OPEN_TIMEOUT);
    }

    getPromise(): Promise<any> {
        return this.promise.getPromise();
    }

    isOpened(): boolean {
        return (this.win);
    }

    // popup is ready to use
    resolve(data: any): void {
        window.clearTimeout(this.openTimeout);
        this.openTimeout = null;
        this.promise.resolve(data);
    }

    reject(data: any): void {
        window.clearTimeout(this.openTimeout);
        this.openTimeout = null;
        this.promise.reject(data);
    }

    close(): void {
        window.clearTimeout(this.openTimeout);
        this.openTimeout = null;
        this.win.close();
    }

    onPinHandler(type: string, callback: Function): void {
        this.onPinCallback = callback;
        this.postMessage(new PopupMessage(POPUP_REQUEST_PIN));
    }

    onPinCallback(fail, success): void {
        this.onPinCallback.apply(null, [fail, success]);
    }

    onPinInvalid(): void {
        this.postMessage(new PopupMessage(POPUP_INVALID_PIN));
    }

    postMessage(message: PopupMessage): void {
        this.win.postMessage(message, '*');
    }

    dispose(): void {
        this.removeAllListeners(['closed']);
    }

}
