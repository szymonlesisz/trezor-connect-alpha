import EventEmitter from '../events/EventEmitter';
import ConnectChannelBrowser from './ConnectChannelBrowser';
import { SHOW_ALERT, SHOW_OPERATION, REQUEST_CONFIRM, REQUEST_PIN, REQUEST_PASSPHRASE } from './ConnectChannel';

export const EVENT_MESSAGE = 'EVENT_MESSAGE';
export const EVENT_ERROR = 'EVENT_ERROR';

export default class Popup extends EventEmitter {

    channel: ConnectChannelBrowser;

    constructor() {
        super();

        this.channel = new ConnectChannelBrowser();
        this.channel.on(SHOW_ALERT, this.showAlert.bind(this));
        this.channel.on(SHOW_OPERATION, this.showOperation.bind(this));
        this.channel.on(REQUEST_CONFIRM, this.requestConfirm.bind(this));
        this.channel.on(REQUEST_PIN, this.requestPin.bind(this));
        this.channel.on(REQUEST_PASSPHRASE, this.requestPassphrase.bind(this));
    }

    showAlert(type: string): void {
        // to override
    }

    showOperation(type: string): void {
        // to override
    }

    requestConfirm(callback: Function): void {
        // to override
    }

    requestPin(callback: Function): void {
        // to override
    }

    requestPassphrase(callback: Function): void {
        // to override
    }

    async open(args: Object): Promise<any> {

        const { type, description } = args;

        switch(type) {
            case 'login' :
                return await this.channel.requestLogin(args);

            case 'signmessage' :
                return await this.channel.signMessage();

            case 'xpubkey' :
                return await this.channel.getXPubKey(description);

            case 'accountinfo' :
                return await this.channel.getAccountInfo(description);
        }

        throw new Error('Unknown type');
        //return await this.channel.requestLogin();
    }
}
