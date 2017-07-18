import EventEmitter from '../../events/EventEmitter';
import ConnectChannelBrowser from '../../connect/ConnectChannelBrowser';
import { SHOW_ALERT, SHOW_OPERATION, REQUEST_CONFIRM, REQUEST_PIN, REQUEST_PASSPHRASE } from '../../connect/ConnectChannel';

export default class AbstractContainer extends EventEmitter {

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

        const method: Function = this.channel[ args.method ];

        if (method === undefined) {
            return Error(`Method ${args.method} not found.`);
        }

        return await method.call(this.channel, args);

        // console.log("METHOD!", method, this.channel['foo'] )

        // switch(method) {
        //     case 'requestLogin' :
        //         return await this.channel.requestLogin(args);

        //     case 'signMessage' :
        //         return await this.channel.signMessage();

        //     case 'getXPubKey' :
        //         return await this.channel.getXPubKey(description);

        //     case 'getAccountInfo' :
        //         return await this.channel.getAccountInfo(description);
        // }

        // throw new Error('Unknown type');
        //return await this.channel.requestLogin();
    }
}
