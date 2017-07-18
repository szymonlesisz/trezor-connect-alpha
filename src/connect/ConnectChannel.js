// @flow
// why bluebird? https://github.com/petkaantonov/bluebird/tree/master/benchmark (4 times faster than es6-promise)
import Promise from 'bluebird';
import EventEmitter from '../events/EventEmitter';
import root from 'window-or-global';
import { getPathFromDescription, getPathFromIndex, serializePath, getHDPath } from '../utils/addressUtils';

//import * as hd from 'hd-wallet';

//import * as trezor from 'trezor.js';
// TODO: Remove it from library
import config from '../utils/configSigned';
//import config from '../utils/configSignedNotValid';

import ConnectedDevice from './ConnectedDevice';
import Account from './Account';
import AccountsList from './AccountsList';

import Device from '../device/Device';
import DeviceList from '../device/DeviceList';

import { resolveAfter, errorHandler, NO_TRANSPORT, NO_CONNECTED_DEVICES, DEVICE_IS_BOOTLOADER, DEVICE_IS_EMPTY, FIRMWARE_IS_OLD } from '../utils/promiseUtils';



const DEBUG: boolean = false;
// 1.3.0 introduced HDNodeType.xpub field
// 1.3.4 has version2 of SignIdentity algorithm
const REQUIRED_FIRMWARE: string = '1.3.4';


export const SHOW_ALERT = 'SHOW_ALERT';
export const SHOW_OPERATION = 'SHOW_OPERATION';
export const UPDATE_VIEW = 'UPDATE_VIEW';
export const REQUEST_CONFIRM = 'REQUEST_CONFIRM';
export const REQUEST_PIN = 'REQUEST_PIN';
export const REQUEST_PASSPHRASE = 'REQUEST_PASSPHRASE';

export default class ConnectChannel extends EventEmitter {

    device: ConnectedDevice;

    constructor(){
        super();
    }

    /*###################################################
    # Public methods called from Popup or Node.js
    ###################################################*/

    /**
     * Request for login signed by TREZOR
     *
     * @param {Object} args
     * @returns {Promise.<Object>}
     */
    async requestLogin(args: Object): Promise<Object> {

        this.emit(SHOW_OPERATION, 'operation_login');

        let origin = root.location.origin.split(':');
        let identity = {
            proto: origin[0],
            host: origin[1].substring(2),
            port: ''
        };
        if (origin[2]) {
            identity.port = origin[2];
        }

        return await this.initDevice({ emptyPassphrase: true })
            .then(function signIdentity(device){
                // TODO: simulation of error
                return device.session.signIdentity(
                    identity,
                    args.challengeHidden,
                    args.challengeVisual
                ).catch( errorHandler(() => signIdentity(device)) );
            })
            .then(result => { // success
                let { message } = result;
                let { public_key, signature } = message;

                // TODO: Fix Error: The action was interrupted by another application. (trezor-link)
                this.device.release();
                return this.device.session.release().then(() => {
                    return {
                        success: true,
                        publicKey: public_key.toLowerCase(),
                        signature: signature.toLowerCase(),
                        version: 2 // since firmware 1.3.4
                    };
                });
            })
            .catch(error => {
                return {
                    success: false,
                    message: error.message
                };
            });
    }

    /**
     * Request for message signed by TREZOR
     *
     * @param {Object} description
     * @returns {Promise.<Object>}
     */
    async signMessage(args: Object): Promise<Object> {

        let path = getPathFromDescription(args.description);
        let msgBuff = Buffer.from(args.message, 'utf8');
        let message = msgBuff.toString('hex');
        let coin = 'Bitcoin'; // TODO: should it be a param?

        this.emit(SHOW_OPERATION, 'operation_signmsg');

        return await this.initDevice()
            .then(function signMessage(device){
                return device.session.signMessage(
                    path,
                    message,
                    coin
                ).catch( errorHandler(() => signMessage(device)) )
            })
            .then(result => {
                let { message } = result;
                let { address, signature } = message;
                let signBuff = Buffer.from(signature, 'hex');
                let baseSign = signBuff.toString('base64');

                this.device.release();
                return this.device.session.release().then(() => {
                    return {
                        success: true,
                        address: address,
                        signature: baseSign
                    };
                });
            })
            .catch(error => {
                return {
                    success: false,
                    message: error.message
                }
            })
    }



    /**
     * Method
     *
     * @param {Object} description
     * @returns {Promise.<Object>}
     */
    async getXPubKey(args: Object) {

        this.emit(SHOW_OPERATION, 'operation_getXPubKey');

        let path = null; //getPathFromDescription(args.description);

        return await this.initDevice()
            .then(device => {
                if(path){
                    // wait for confirmation
                    return new Promise((resolve, reject) => {
                        this.emit(REQUEST_CONFIRM, {
                            type: 'xpubkey',
                            xpubkey: path,
                            callback: submit => resolve(submit)
                        });
                    });

                }else{

                    const updateAccountList = (node) => {
                        console.log("APPdejt", node);
                        let acc = new Account(node);
                        acc.discover();

                        this.emit(UPDATE_VIEW, node);
                    }

                    AccountsList.get(device, updateAccountList)
                    .then(list => {
                        console.log("ACC list", list);
                        // TODO
                    });

                    // wait for confirmation
                    return new Promise(resolve => {
                        this.emit(REQUEST_CONFIRM, {
                            type: 'accountlist',
                            callback: submit => resolve(submit)
                        });
                    });
                }

            })
            .then(submit => {
                if(submit){
                    if(path){
                        return this.device.session.getPublicKey(path);
                    }else{

                    }
                }else{
                    // TODO: all errors should be stored in one place, not hardcoded
                    throw Error('Not confirmed');
                }
            })
            .then(result => {
                let { xpub, node } = result.message;
                let serializedPath = serializePath(path);

                // TODO: releasing device should be common for all methods
                this.device.release();
                return this.device.session.release().then(() => {
                    return {
                        success: true,
                        xpubkey: xpub,
                        chainCode: node.chain_code,
                        publicKey: node.public_key,
                        path,
                        serializedPath
                    };
                });
            })
            .catch(error => {
                return {
                    success: false,
                    message: error.message
                }
            })
    }

    async getCypherKeyValue(args:Object){
        console.log("getCypherKeyValue", args);

        var path = getHDPath(args.path); // TODO parse from account id or xpub
        var key = args.key;
        var value = args.value;
        var encrypt = args.encrypt;
        var confirmEncrypt = args.confirmEncrypt;
        var confirmDecrypt = args.confirmDecrypt;

        if(args.encrypt){
            this.emit(SHOW_OPERATION, 'operation_cipherkeyvalue_encrypt');
        }else{
            this.emit(SHOW_OPERATION, 'operation_cipherkeyvalue_decrypt');
        }

        /*
        if (typeof path === 'string') {
                path = parseHDPath(path);
            }
            if (typeof value !== 'string') {
                throw new TypeError('TrezorConnect: Value must be a string');
            }
            if (!(/^[0-9A-Fa-f]*$/.test(value))) {
                throw new TypeError('TrezorConnect: Value must be hexadecimal');
            }
            if (value.length % 32 !== 0) {
                // 1 byte == 2 hex strings
                throw new TypeError('TrezorConnect: Value length must be multiple of 16 bytes');
            }
        */

        return await this.initDevice({ emptyPassphrase: true })
            .then(function cipherKeyValue(device){
                // TODO: simulation of error
                return device.session.cipherKeyValue(
                    path,
                    key,
                    value,
                    encrypt,
                    confirmEncrypt,
                    confirmDecrypt
                ).catch( errorHandler(() => cipherKeyValue(device)) );
            })
            .then(result => {
                // TODO: releasing device should be common for all methods
                this.device.release();
                return this.device.session.release().then(() => {
                    return {
                        success: true,
                        value: result.message.value
                    };
                });
            })
            .catch(error => {
                return {
                    success: false,
                    message: error.message
                }
            })

    }






    /**
     * Method
     *
     * @param {Object} description
     * @returns {Promise.<Object>}
     */
    async getAccountInfo(description: any) {

        // id
        let path = getPathFromIndex(0);
        console.log("PATH!", path);

        // xpub
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].reduce(
            (prev, current) => {
                console.log( prev, current);
                return prev.then(account => {
                    console.log(current, account);
                    return null;
                });
            },
            Promise.resolve(null)
        )
        // .then(account => {
        //     console.log("ACC", account);
        // })

        return await this.initDevice()
            .then(device => {
                return device.getNode(path);
            })
            //.then(node => new Account(node, i, cryptoChannel, blockchain));
            .then(node => {
                console.log("NODE!", node)

                return new Promise(resolve => {});
            });





    }

    async getAccountById(device, id) {
        return await Account.fromDevice(device, id, createCryptoChannel(), createBlockchain())
            .then(node => {
                //console.log("GetAcc", device.getNode);
            });
    }

     /* Not working for now...
    createCryptoChannel() {
        const CRYPTO_WORKER_PATH = '../vendor/trezor-crypto-dist.js';
        let worker = new Worker(CRYPTO_WORKER_PATH);
        let channel = new hd.WorkerChannel(worker);
        return channel;
    }

    createBlockchain() {
        const BITCORE_URLS = ['https://bitcore3.trezor.io', 'https://bitcore1.trezor.io'];
        return new hd.BitcoreBlockchain(BITCORE_URLS, () => createSocketWorker());
    }

    createSocketWorker() {
        const SOCKET_WORKER_PATH = '../vendor/socket-worker-dist.js';
        let socketWorker = new Worker(SOCKET_WORKER_PATH);
        return socketWorker;
    }
    */


    /*
    * Local methods to communicate with trezor.js
    */

    async initDevice({emptyPassphrase} = {}): Promise<Device> {
        return await this.initTransport()
            .then(list => resolveAfter(500, list))
            .then(list => this.waitForFirstDevice(list))
            .then(device => {
                this.device = device;

                if(emptyPassphrase){
                    device.session.on('passphrase', callback => {
                        console.log("TODO: handle empty pass!")
                    });
                }else{
                    device.session.on('passphrase', this.onDevicePassphraseHandler.bind(this));
                }

                device.session.on('passphrase', this.onDevicePassphraseHandler.bind(this));
                device.session.on('button', this.onDeviceButtonHandler.bind(this));
                device.session.on('pin', this.onDevicePinHandler.bind(this));

                return device;
            })
            // if error handler will catch not resolveable promise (such as NO_TRASPORT)
            // will emit alert with screen id
            .catch(errorHandler(alert => this.emit(SHOW_ALERT, alert)));
    }

    // This promise could never be resolved

    async initTransport(): Promise<DeviceList> {
        let promise = new Promise((resolve, reject) => {
            let list = new DeviceList({
                config: config,
                debug: DEBUG
            });
            const onTransport = () => {
                list.removeListener('error', onError);
                list.removeListener('transport', onTransport);
                resolve(list);
            };
            const onError = () => {
                list.removeListener('error', onError);
                list.removeListener('transport', onTransport);
                reject(NO_TRANSPORT);
            };
            list.on('error', onError);
            list.on('transport', onTransport);
        });

        try {
            return await promise;
        } catch (error) {
            throw error;
        }
    }

    // This promise can be looped (waiting for device)
    // or never resolved (bootloader, empty, old firmware)

    async waitForFirstDevice(list: DeviceList): Promise<Device> {
        let promise = new Promise((resolve, reject) => {
            if (!(list.hasDeviceOrUnacquiredDevice())) {
                reject(NO_CONNECTED_DEVICES);
            } else {
                list.acquireFirstDevice(true)
                    .then(({device, session}) => new ConnectedDevice(session, device))
                    .then(device => {
                        if(device.isBootloader()){
                            reject(DEVICE_IS_BOOTLOADER);
                        }else if(!device.isInitialized()){
                            reject(DEVICE_IS_EMPTY);
                        }else if(!device.atLeast(REQUIRED_FIRMWARE)){
                            reject(FIRMWARE_IS_OLD);
                        }else{
                            resolve(device);
                        }
                    });
            }
        });

        try {
            // looping case
            // first param is a looping function, second is a alert emiter
            return await promise.catch(errorHandler(
                () => this.waitForFirstDevice(list),
                alert => this.emit(SHOW_ALERT, alert)
            ));
        } catch (error) {
            throw error;
        }
    }

    onDevicePassphraseHandler(a, b) {
        console.log("PASSphrase handler - show form!", a, b);
        //this.emit(REQUEST_PASSPHRASE);
    }

    onDeviceButtonHandler(code: string): void {
        console.log("onDeviceButtonHandler", code)

        const receive = (type) => {
            this.device.session.removeListener('receive', receive);
            this.device.session.removeListener('error', receive);
            this.emit(SHOW_ALERT, 'global');
        };

        this.device.session.on('receive', receive); // unnecessary? after 1st confirm (host) will receive 'pin' event
        this.device.session.on('error', receive);

        switch (code) {
            case 'ButtonRequest_ConfirmOutput':
            case 'ButtonRequest_SignTx':
                this.emit(SHOW_ALERT, 'confirm_tx');
                break;
            default:
                this.emit(SHOW_ALERT, 'confirm')
                break;
        }
    }

    onDevicePinHandler(type: string, callback: Function): void {
        console.log("onDevicePinHandler", type)

        this.emit(REQUEST_PIN, callback);
    }
}
