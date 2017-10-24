/* @flow */
'use strict';

import * as DEVICE from '../constants/device';
import randombytes from 'randombytes';
import type {Transport} from 'trezor-link';
import * as trezor from './trezorTypes';
import { getHDPath } from '../utils/pathUtils';
import Device from './Device';
import ConfigManager from '../utils/ConfigManager';
//import Parameter from 'parameter'; // webpack error while building

import * as bitcoin from 'bitcoinjs-lib-zcash';
import * as hdnodeUtils from '../utils/hdnode';

function assertType(res: DefaultMessageResponse, resType: string) {
    if (res.type !== resType) {
        throw new TypeError(`Response of unexpected type: ${res.type}`);
    }
}

function generateEntropy(len: number): Buffer {
    if (global.crypto || global.msCrypto) {
        return randombytes(len);
    } else {
        throw new Error('Browser does not support crypto random');
    }
}

function filterForLog(type: string, msg: Object): Object {
    const blacklist = {
        PassphraseAck: {
            passphrase: '(redacted...)',
        },
        CipheredKeyValue: {
            value: '(redacted...)',
        },
        GetPublicKey: {
            address_n: '(redacted...)',
        },
        PublicKey: {
            node: '(redacted...)',
            xpub: '(redacted...)',
        },
        DecryptedMessage: {
            message: '(redacted...)',
            address: '(redacted...)',
        },
    };

    if (type in blacklist) {
        return { ...msg, ...blacklist[type] };
    } else {
        return msg;
    }
}

export type MessageResponse<T> = {
    type: string;
    message: T; // in general, can be anything
};



export type DefaultMessageResponse = MessageResponse<Object>;

export type CallParams = {
    method: string;
};


export const parseParams = (params:Object): CallParams => {

    console.log("PARSEPARAMS", ConfigManager.getMethodParams(params.method) )

    // const {
    //     requiredFirmware,
    //     rules
    // } = ConfigManager.getMethodParams(params.method);

    // const p: Parameter = new Parameter();
    // let err = p.validate(rules, params);
    // console.log("parseParams", err);

    return params;
    // return {
    //     method: params.method
    // }
}

export default class DeviceCommands {
    device: Device;
    transport: Transport;
    sessionId: string;
    debug: boolean;
    disposed: boolean;

    constructor(
        device: Device,
        transport: Transport,
        sessionId: string
    ) {
        this.device = device;
        this.transport = transport;
        this.sessionId = sessionId;
        this.debug = false;
        this.disposed = false;
    }

    dispose():void {
        this.disposed = true;
    }

    parse(params: CallParams) {
        switch(params.method) {
            case 'getXPub':
                console.log("CALL FROM PARSE!");
            break;
        }
    }

    initialize() {

    }

    async signMessage(
        address: Array<number> | string,
        message: string,
        coin: trezor.CoinType | string
    ): Promise<DefaultMessageResponse> {

        if (typeof address === 'string') {
            address = getHDPath(address);
        }

        //coinName(coin)
        return await this.typedCall('SignMessage', 'MessageSignature', {
            address_n: address,
            message: message,
            coin_name: 'Bitcoin',
        });
    }

    async getPublicKey(
        address: Array<number> | string,
        coin: ?(trezor.CoinType | string)
    ): Promise<DefaultMessageResponse> {
        // const coin_name = coin ? coinName(coin) : 'Bitcoin';
        if (typeof address === 'string') {
            address = getHDPath(address);
        }

        const resp: DefaultMessageResponse = await this.typedCall('GetPublicKey', 'PublicKey', {
            address_n: address,
            coin_name: 'Bitcoin',
        });
        resp.message.node.path = address || [];
        return resp;
    }


    // Validation of xpub

    async getHDNode(
        path: Array<number>,
        //network: trezor.CoinType | string | bitcoin.Network
        network: bitcoin.Network
    ): Promise<bitcoin.HDNode> {

        // TODO: parse network
        const suffix: number = 0;
        const childPath: Array<number> = path.concat([suffix]);

        const resKey: MessageResponse<trezor.PublicKey> = await this.getPublicKey(path);
        const childKey: MessageResponse<trezor.PublicKey> = await this.getPublicKey(childPath);

        const resNode: bitcoin.HDNode = hdnodeUtils.pubKey2bjsNode(resKey, network);
        const childNode: bitcoin.HDNode = hdnodeUtils.pubKey2bjsNode(childKey, network);

        hdnodeUtils.checkDerivation(resNode, childNode, suffix);

        return resNode;

    }

    // Sends an async message to the opened device.
    call(type: string, msg: Object = {}): Promise<DefaultMessageResponse> {
        const logMessage: Object = filterForLog(type, msg);

        if (this.debug) {
            console.log('[trezor.js] [call] Sending', type, logMessage);
        }

        //this.session.sendEvent.emit(type, msg);

        return this.transport.call(this.sessionId, type, msg).then(
            (res: DefaultMessageResponse) => {
                const logMessage = filterForLog(res.type, res.message);

                if (this.debug) {
                    console.log('[trezor.js] [call] Received', res.type, logMessage);
                }
                //this.session.receiveEvent.emit(res.type, res.message);
                return res;
            },
            err => {
                if (this.debug) {
                    console.log('[trezor.js] [call] Received error', err);
                }
                //this.session.errorEvent.emit(err);
                throw err;
            }
        );
    }

    typedCall(type: string, resType: string, msg: Object = {}): Promise<DefaultMessageResponse> {

        if (this.disposed) {
            throw new Error("DeviceCommands already disposed");
        }

        return this._commonCall(type, msg).then(res => {
            assertType(res, resType);
            return res;
        });
    }

    _commonCall(type: string, msg: Object): Promise<DefaultMessageResponse> {
        return this.call(type, msg).then(res =>
            this._filterCommonTypes(res)
        );
    }

    _filterCommonTypes(res: DefaultMessageResponse): Promise<DefaultMessageResponse> {
        if (res.type === 'Failure') {
            console.log("Failuer!", res)
            const e = new Error(res.message.message);
            // $FlowIssue extending errors in ES6 "correctly" is a PITA
            e.code = res.message.code;
            return Promise.reject(e);
        }

        if (res.type === 'ButtonRequest') {
            this.device.emit('button', res.message.code);
            return this._commonCall('ButtonAck', {});
        }

        if (res.type === 'EntropyRequest') {
            return this._commonCall('EntropyAck', {
                entropy: generateEntropy(32).toString('hex'),
            });
        }

        if (res.type === 'PinMatrixRequest') {
            return this._promptPin(res.message.type).then(
                pin => {
                    return this._commonCall('PinMatrixAck', { pin: pin });
                },
                () => {
                    return this._commonCall('Cancel', {});
                }
            );
        }

        if (res.type === 'PassphraseRequest') {
            const cachedPassphrase: string = this.device.getPassphrase();
            if (typeof cachedPassphrase === 'string') {
                return this._commonCall('PassphraseAck', { passphrase: cachedPassphrase });
            }

            return this._promptPassphrase().then(
                passphrase => {
                    this.device.setPassphrase(passphrase);
                    return this._commonCall('PassphraseAck', { passphrase: passphrase });
                },
                err => {
                    return this._commonCall('Cancel', {}).catch(e => {
                        throw err || e;
                    });
                }
            );
        }

        if (res.type === 'WordRequest') {
            return this._promptWord().then(
                word => {
                    return this._commonCall('WordAck', { word: word });
                },
                () => {
                    return this._commonCall('Cancel', {});
                }
            );
        }

        return Promise.resolve(res);
    }

    _promptPin(type: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.device.listenerCount(DEVICE.PIN) > 0) {
                this.device.emit(DEVICE.PIN, type, (err, pin) => {
                    if (err || pin == null) {
                        reject(err);
                    } else {
                        resolve(pin);
                    }
                });
            } else {
                //if (this.session.debug) {
                    console.warn('[trezor.js] [call] PIN callback not configured, cancelling request');
                //}
                reject(new Error('PIN callback not configured'));
            }
        });
    }

    _promptPassphrase(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.device.listenerCount(DEVICE.PASSPHRASE) > 0) {
                this.device.emit(DEVICE.PASSPHRASE, (err, passphrase) => {
                    if (err || passphrase == null) {
                        reject(err);
                    } else {
                        resolve(passphrase.normalize('NFKD'));
                    }
                });
            } else {
                //if (this.session.debug) {
                    console.warn('[trezor.js] [call] Passphrase callback not configured, cancelling request');
                //}
                reject(new Error('Passphrase callback not configured'));
            }
        });
    }

    _promptWord(): Promise<string> {
        return new Promise((resolve, reject) => {
            // if (!this.session.wordEvent.emit((err, word) => {
            //     if (err || word == null) {
            //         reject(err);
            //     } else {
            //         resolve(word.toLocaleLowerCase());
            //     }
            // })) {
            //     if (this.session.debug) {
            //         console.warn('[trezor.js] [call] Word callback not configured, cancelling request');
            //     }
            reject(new Error('Word callback not configured'));
            // }
        });
    }
}
