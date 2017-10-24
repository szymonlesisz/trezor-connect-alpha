// @flow
'use strict';

/**
 * (C) 2017 SatoshiLabs
 * TODO: description
 * GPLv3
 */

import TrezorBase, { eventEmitter } from '../index';

import * as POPUP from '../constants/popup';
import * as IFRAME from '../constants/iframe';
import * as ERROR from '../constants/errors';
import * as UI from '../constants/ui';

import ModalManager from '../modal/ModalManager';

import { create as createDeferred } from '../utils/deferred';
import type { Deferred } from '../utils/deferred';

import { Channel, CHANNEL_EVENT, init as initChannel } from '../channel/Channel';
import { UI_EVENT, DEVICE_EVENT, RESPONSE_EVENT } from '../channel/ChannelMessage';
import type { ChannelMessage } from '../channel/ChannelMessage';

import { parse as parseSettings } from '../channel/ConnectSettings';
import type { ConnectSettings } from '../channel/ConnectSettings';


let _channel: Channel;
let _messageID: number = 0;
let _messagePromises: { [key: number]: Deferred<void> } = {};
let _settings: ConnectSettings;

const initModalManager = (): ModalManager => {
    const pm: ModalManager = new ModalManager();
    pm.on(POPUP.CLOSED, () => {
        postMessage({ type: POPUP.CLOSED }, false);
    });
    return pm;
}
// init modal manager
const _modalManager: ModalManager = initModalManager();

// Outgoing messages
const postMessage = (message: any, usePromise:boolean = true): ?Promise<void> => {
    _messageID++;
    message.id = _messageID;
    _channel.handleMessage(message);

    if (usePromise) {
        _messagePromises[_messageID] = createDeferred();
        return _messagePromises[_messageID].promise;
    }
    return null;
}

// Incoming messages
const handleMessage = (message: ChannelMessage) => {
    console.log("[index.js]", "onMessage", message)

    // TODO: destructuring with type
    // https://github.com/Microsoft/TypeScript/issues/240
    //const { id, event, type, data, error }: ChannelMessage = message;
    const id: number = message.id || 0;
    const event: string = message.event;
    const type: string = message.type;
    const data: any = message.data;
    const error: any = message.error;

    switch(event) {

        case RESPONSE_EVENT :
            if (_messagePromises[id]) {
                _messagePromises[id].resolve(data);
                delete _messagePromises[id];
            } else {
                console.warn(`Unknown message promise id ${id}`, _messagePromises);
            }
        break;

        case DEVICE_EVENT :
            // pass DEVICE event up to interpreter
            eventEmitter.emit(event, message);
            eventEmitter.emit(type, data); // DEVICE_EVENT also emit single events (device_connect/device_disconnect...)
        break;

        case UI_EVENT :
            // pass UI event up
            eventEmitter.emit(event, type, data);
        break;

        default:
            console.warn("Undefined message ", event, message)
    }
}

class Trezor extends TrezorBase {

    static async init(settings: Object): Promise<void> {
        if (_channel)
            throw ERROR.IFRAME_INITIALIZED;

        _settings = parseSettings(settings);

        //window.fetch('http://karma-runner.github.io/0.13/config/configuration-file.html');
        //window.fetch('https://httpbin.org/get');

        _channel = await initChannel();
        _channel.on(CHANNEL_EVENT, handleMessage);

        // TODO: check js script GET parameters (additional settings)
    }

    static changeSettings(settings: Object) {
        _settings = parseSettings(settings, _settings);
        postMessage({ type: UI.CHANGE_SETTINGS, data: _settings }, false);
    }

    // static async getPublicKey(params: Object): Promise<Object> {
    //     return await Trezor.__call( { method: 'getxpub', ...params } );
    // }

    // // TODO
    // static async customCall(params: Object): Promise<Object> {
    //     return await Trezor.__call(params);
    // }

    static uiMessage(message: Object): void {
        // TODO: parse and validate incoming data injections
        //
        _channel.handleMessage({ event: 'UI_EVENT', ...message } );
    }

    static async __call(params: Object): Promise<Object> {
        // post message to iframe
        try {
            if (!_channel) {
                return { success: false, message: "Channel not initialized yet" };
            }


            const response: ?Object = await postMessage({ type: IFRAME.CALL, data: params });
            if (response) {
                return response;
            } else {
                // TODO
                return { success: false }
            }
        } catch(error) {
            console.log("Call error", error)
            return error;
        }
    }

    static dispose(): void {
        // TODO
        //super.dispose();
    }

}

module.exports = Trezor;
