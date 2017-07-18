/* @flow */
'use strict';
import randombytes from 'randombytes';
import type {Transport} from 'trezor-link';
import type Session from '../device/Session';
import type {DefaultMessageResponse} from '../device/Session';

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

export class CallHelper {
    transport: Transport;
    sessionId: string;
    session: Session;

    constructor(
        transport: Transport,
        sessionId: string,
        session: Session
    ) {
        this.transport = transport;
        this.sessionId = sessionId;
        this.session = session;
    }

    // Sends an async message to the opened device.
    call(type: string, msg: Object = {}): Promise<DefaultMessageResponse> {
        const logMessage: Object = filterForLog(type, msg);

        if (this.session.debug) {
            console.log('[trezor.js] [call] Sending', type, logMessage);
        }
        this.session.sendEvent.emit(type, msg);

        return this.transport.call(this.sessionId, type, msg).then(
            (res: DefaultMessageResponse) => {
                const logMessage = filterForLog(res.type, res.message);

                if (this.session.debug) {
                    console.log('[trezor.js] [call] Received', res.type, logMessage);
                }
                this.session.receiveEvent.emit(res.type, res.message);
                return res;
            },
            err => {
                if (this.session.debug) {
                    console.log('[trezor.js] [call] Received error', err);
                }
                this.session.errorEvent.emit(err);
                throw err;
            }
        );
    }

    typedCall(type: string, resType: string, msg: Object = {}): Promise<DefaultMessageResponse> {
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
            const e = new Error(res.message.message);
            // $FlowIssue extending errors in ES6 "correctly" is a PITA
            e.code = res.message.code;
            return Promise.reject(e);
        }

        if (res.type === 'ButtonRequest') {
            this.session.buttonEvent.emit(res.message.code);
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
            return this._promptPassphrase().then(
                passphrase => {
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
            if (!this.session.pinEvent.emit(type, (err, pin) => {
                if (err || pin == null) {
                    reject(err);
                } else {
                    resolve(pin);
                }
            })) {
                if (this.session.debug) {
                    console.warn('[trezor.js] [call] PIN callback not configured, cancelling request');
                }
                reject(new Error('PIN callback not configured'));
            }
        });
    }

    _promptPassphrase(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.session.passphraseEvent.emit((err, passphrase) => {
                if (err || passphrase == null) {
                    reject(err);
                } else {
                    resolve(passphrase.normalize('NFKD'));
                }
            })) {
                if (this.session.debug) {
                    console.warn('[trezor.js] [call] Passphrase callback not configured, cancelling request');
                }
                reject(new Error('Passphrase callback not configured'));
            }
        });
    }

    _promptWord(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.session.wordEvent.emit((err, word) => {
                if (err || word == null) {
                    reject(err);
                } else {
                    resolve(word.toLocaleLowerCase());
                }
            })) {
                if (this.session.debug) {
                    console.warn('[trezor.js] [call] Word callback not configured, cancelling request');
                }
                reject(new Error('Word callback not configured'));
            }
        });
    }
}
