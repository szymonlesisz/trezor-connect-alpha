// @flow
'use strict';

/**
 * (C) 2017 SatoshiLabs
 * TODO: description
 * GPLv3
 */

import ViewManager from './view/ViewManager';

class TrezorConnect {

    static parseArgs(args:Object): Object {
        return {
            ...args,
            icon: args.icon || null,
            container: args.container || 'modal',
            firmware: args.firmware || null
        }
    }

    static async requestLogin(args: Object): Promise<Object> {
        args = TrezorConnect.parseArgs(args);
        return await ViewManager.call({
            method: 'requestLogin',
            ...args
        });
    }

    static async signMessage(args: Object): Promise<Object> {
        args = TrezorConnect.parseArgs(args);
        return await ViewManager.call({
            method: 'signMessage',
            ...args
        });
    }

    static async getXPubKey(args: Object): Promise<Object> {
        args = TrezorConnect.parseArgs(args);
        return await ViewManager.call({
            method: 'getXPubKey',
            ...args
        });
    }


    static async getAccountInfo(args: Object): Promise<Object> {
        args = TrezorConnect.parseArgs(args);
        return await ViewManager.call({
            method: 'getAccountInfo',
            ...args
        });
    }

    static async getCypherKeyValue(args: Object): Promise<any> {
        args = TrezorConnect.parseArgs(args);
        return await ViewManager.call({
            method: 'getCypherKeyValue',
            ...args
        });
    }


}

module.exports = TrezorConnect;
