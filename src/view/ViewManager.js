// @flow
import type ConnectChannel from '../connect/ConnectChannel';
import type AbstractContainer from './containers/AbstractContainer';
import Popup from './containers/Popup';
import Modal from './containers/Modal';

/**
 * Absract wrapper
 */
export default class ViewManager {

    static parseArgs(args: Object): Object {

        if (args.coin) {
            // TODO: verify coin name
        }
        return {
            ...args,
            icon: args.icon || null,
            container: args.container || 'modal',
            firmware: args.firmware || null
        }
    }

    static getChannel(): ConnectChannel {
        // to override
    }

    static getViewContainer(args: Object): AbstractContainer {
        let channel: ConnectChannel = this.getChannel();
        let container: AbstractContainer = args.container === 'popup' ? new Popup(channel) : new Modal(channel);
        return container;
    }

    static async requestLogin(args: Object): Promise<Object> {
        args = this.parseArgs(args);
        return await this.getViewContainer(args).open({
            method: 'requestLogin',
            ...args
        });
    }

    static async signMessage(args: Object): Promise<Object> {
        args = this.parseArgs(args);
        return await this.getViewContainer(args).open({
            method: 'signMessage',
            ...args
        });
    }

    static async verifyMessage(args: Object): Promise<Object> {
        args = this.parseArgs(args);
        return await this.getViewContainer(args).open({
            method: 'verifyMessage',
            ...args
        });
    }

    static async getXPubKey(args: Object): Promise<Object> {
        args = this.parseArgs(args);
        return await this.getViewContainer(args).open({
            method: 'getXPubKey',
            ...args
        });
    }


    static async getAccountInfo(args: Object): Promise<Object> {
        args = this.parseArgs(args);
        return await this.getViewContainer(args).open({
            method: 'getAccountInfo',
            ...args
        });
    }

    static async getCypherKeyValue(args: Object): Promise<any> {
        args = this.parseArgs(args);
        return await this.getViewContainer(args).open({
            method: 'getCypherKeyValue',
            ...args
        });
    }
};
