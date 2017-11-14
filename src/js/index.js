// @flow
'use strict';

import EventEmitter from 'events';

export const eventEmitter: EventEmitter = new EventEmitter();

export default class Trezor {

    static on(type: string, fn: Function): void {
        eventEmitter.on(type, fn);
    }

    static off(type: string, fn: Function): void {
        eventEmitter.removeListener(type, fn);
    }

    static async init(settings: Object): Promise<void> {
        // to override
    }

    static changeSettings(settings: Object) {
        // to override
    }

    static async requestLogin(params: Object): Promise<Object> {
        return await this.__call( { method: 'requestLogin', ...params } );
    }

    static async getPublicKey(params: Object): Promise<Object> {
        return await this.__call( { method: 'getxpub', ...params } );
    }

    static async composeTransaction(params: Object): Promise<Object> {
        return await this.__call( { method: 'composetx', ...params } );
    }

    // TODO
    static async customCall(params: Object): Promise<Object> {
        return await this.__call( { method: 'custom', ...params } );
    }

    static async __call(params: Object): Promise<Object> {
        // to override
        return {};
    }

    static uiMessage(message): void {
        // to override
    }

    static dispose(): void {
        // TODO!
    }
}
