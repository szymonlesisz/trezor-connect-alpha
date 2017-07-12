import EventEmitter from '../events/EventEmitter';
import ConnectChannelBrowser from './ConnectChannelBrowser';
import { SHOW_ALERT, REQUEST_PIN } from './ConnectChannel';

export const EVENT_MESSAGE = 'EVENT_MESSAGE';
export const EVENT_ERROR = 'EVENT_ERROR';

export default class Popup extends EventEmitter {

    channel: ConnectChannelBrowser;

    constructor() {
        super();

        this.channel = new ConnectChannelBrowser();
        this.channel.on(SHOW_ALERT, this.showAlert.bind(this));
        this.channel.on(REQUEST_PIN, this.requestPin.bind(this));
    }

    showAlert(type){
        // to override
        console.log("SHOW ALERT", type)
    }

    requestPin(callback){
        // to override
    }

    async open(args: Object): Promise<any> {

        const { type, description } = args;

        switch(type) {
            case 'login' :
                return await this.channel.requestLogin(args);

            case 'accountinfo' :
                return await this.channel.getAccountInfo(description);
        }

        throw new Error('Unknown type');
        //return await this.channel.requestLogin();
    }
}
