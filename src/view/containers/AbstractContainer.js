// @flow
import EventEmitter from '../../events/EventEmitter';
import type ConnectChannel from '../../connect/ConnectChannel';
import ViewRenderer from '../ViewRenderer';
import { SHOW_COMPONENT, SHOW_OPERATION, REQUEST_CONFIRM, REQUEST_PIN, REQUEST_PASSPHRASE } from '../../connect/ConnectChannel';

export default class AbstractContainer extends EventEmitter {

    channel: ConnectChannel;
    renderer: ViewRenderer;

    constructor(channel: ConnectChannel) {
        super();

        this.channel = channel;
        this.channel.on(SHOW_COMPONENT, this.showComponent.bind(this));
        this.channel.on(SHOW_OPERATION, this.showOperation.bind(this));
        this.channel.on(REQUEST_CONFIRM, this.requestConfirm.bind(this));
        this.channel.on(REQUEST_PIN, this.requestPin.bind(this));
        this.channel.on(REQUEST_PASSPHRASE, this.requestPassphrase.bind(this));

        this.renderer = new ViewRenderer();
    }

    showComponent(type: string): void {

        if(type.indexOf('alert') === 0){
            this.renderer.showAlert(type);
        }else{
            this.renderer.showConfirmPromt(type);
        }

    }

    showOperation(type: string): void {
        this.renderer.showOperation(type);
    }

    requestConfirm(data: Object): void {
        this.renderer.requestConfirm(data);
    }

    requestPin(callback: Function): void {
        this.renderer.requestPin(callback);
    }

    requestPassphrase(callback: Function): void {
        // to override
        //this.renderer.requestPassphrase(callback);
    }

    async open(args: Object): Promise<any> {

        const method: Function = this.channel[ args.method ];

        if (method === undefined) {
            return Error(`Method ${args.method} not found.`);
        }

        return await method.call(this.channel, args);
    }
}
