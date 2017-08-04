// @flow
// why bluebird? https://github.com/petkaantonov/bluebird/tree/master/benchmark (4 times faster than es6-promise)
//import Promise from 'bluebird';
import EventEmitter from '../events/EventEmitter';
import root from 'window-or-global';
import { getPathFromDescription, getPathFromIndex, getSerializedPath, getHDPath, xpubKeyLabel } from '../utils/pathUtils';

// TODO: Remove it from library
import config from '../utils/configSigned';
//import config from '../utils/configSignedNotValid';

import ConnectedDevice from './ConnectedDevice';

import Device from '../device/Device';
import DeviceList from '../device/DeviceList';
import AccountsList from './AccountsList';

import { resolveAfter, errorHandler, NO_TRANSPORT, NO_CONNECTED_DEVICES, DEVICE_IS_BOOTLOADER, DEVICE_IS_EMPTY, FIRMWARE_IS_OLD } from '../utils/promiseUtils';

const DEBUG: boolean = false;
// 1.3.0 introduced HDNodeType.xpub field
// 1.3.4 has version2 of SignIdentity algorithm
const REQUIRED_FIRMWARE: string = '1.3.4';


export const SHOW_COMPONENT = 'SHOW_COMPONENT';
export const SHOW_OPERATION = 'SHOW_OPERATION';
export const UPDATE_VIEW = 'UPDATE_VIEW';
export const REQUEST_CONFIRM = 'REQUEST_CONFIRM';
export const REQUEST_PIN = 'REQUEST_PIN';
export const REQUEST_PASSPHRASE = 'REQUEST_PASSPHRASE';

export default class ConnectChannel extends EventEmitter {

    device: ConnectedDevice;

    /**
     * Common method for ConnectChannelBrowser and ConnectChannelLite
     * return ./connect/Account or null
     * If result is null, then TrezorConnect will not have a access to Account methods (hd-wallet, Bitcore, WebWorkers or online requests)
     *
     * @param {any} node
     * @returns {any}
     */
    getAccount(node: any ): any {
        return null;
    }

    /*###################################################
    # Public methods called from ViewManager or NodeJS
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
            .then(function signIdentity(device: ConnectedDevice){
                console.log("SIGN session", device.session)
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
                return this.releaseDevice({
                    success: true,
                    publicKey: public_key.toLowerCase(),
                    signature: signature.toLowerCase()
                });
            })
            .catch(error => {
                return this.releaseDevice({
                    success: false,
                    message: error.message
                });
            });
    }

    /**
     * Request for message signed by TREZOR
     *
     * @param {Object} args
     * @returns {Promise.<Object>}
     */
    async signMessage(args: Object): Promise<Object> {

        this.emit(SHOW_OPERATION, 'operation_signmsg');

        // TODO: if description == null discover accounts then find all addresses for this account

        let path = getPathFromDescription(args.description);
        let message = Buffer.from(args.message, 'utf8').toString('hex');
        let coin = args.coin || 'Bitcoin'; // TODO: should it be a param?

        return await this.initDevice()
            .then(function signMessage(device: ConnectedDevice){
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

                return this.releaseDevice({
                    success: true,
                    address: address,
                    signature: baseSign
                });
            })
            .catch(error => {
                return this.releaseDevice({
                    success: false,
                    message: error.message
                });
            });
    }

    /**
     * Verify signed message
     *
     * @param {Object} args
     * @returns {Promise.<Object>}
     */
    async verifyMessage(args: Object): Promise<Object> {

        this.emit(SHOW_OPERATION, 'operation_verifyMessage');

        let message = Buffer.from(args.message, 'utf8').toString('hex');
        let signature = Buffer.from(args.signature, 'base64').toString('hex');
        let coin = args.coin || 'Bitcoin';

        return await this.initDevice()
            .then(function verifyMessage(device: ConnectedDevice){
                return device.session.verifyMessage(
                    args.address,
                    signature,
                    message,
                    coin
                ).catch( errorHandler(() => verifyMessage(device)) )
            })
            .then(result => {
                if (result === undefined || result.type !== 'Success') {
                    throw new Error('Message not verified');
                }
                return this.releaseDevice({
                    success: true
                });
            })
            .catch(error => {
                return this.releaseDevice({
                    success: false,
                    message: error.message
                });
            });
    }

    /**
     * getCypherKeyValue
     *
     * @param {Object} args
     * @returns {Promise.<Object>}
     */
    async getCypherKeyValue(args: Object): Promise<Object> {

        this.emit(SHOW_OPERATION, args.encrypt ? 'operation_cipherkeyvalue_encrypt' : 'operation_cipherkeyvalue_decrypt');

        var path = getHDPath(args.path); // TODO parse from account id or xpub

        return await this.initDevice({ emptyPassphrase: true })
            .then(function cipherKeyValue(device: ConnectedDevice){
                // TODO: simulation of all possible errors
                return device.session.cipherKeyValue(
                    path,
                    args.key,
                    args.value,
                    args.encrypt,
                    args.confirmEncrypt,
                    args.confirmDecrypt
                ).catch( errorHandler(() => cipherKeyValue(device)) );
            })
            .then(result => {
                return this.releaseDevice({
                    success: true,
                    value: result.message.value
                });
            })
            .catch(error => {
                return this.releaseDevice({
                    success: false,
                    message: error.message
                });
            });

    }

    /**
     * Method
     *
     * @param {Object} description
     * @returns {Promise.<Object>}
     */
    async getXPubKey(args: Object): Promise<Object> {

        this.emit(SHOW_OPERATION, 'operation_getXPubKey');

        let path = getPathFromDescription(args.description);
        let accountListComplete = true;
        args.confirm = true;

        return await this.initDevice()
            .then((device: ConnectedDevice) => {

                if(path !== null && path !== undefined){
                    if (args.confirm) {
                        // wait for confirmation
                        return new Promise((resolve, reject) => {
                            this.emit(REQUEST_CONFIRM, {
                                type: 'xpubKey',
                                xpubkey: path,
                                callback: submit => resolve(submit)
                            });
                        });
                    }else{
                        // confirm immediately
                        return Promise.resolve(true);
                    }
                }else{
                    accountListComplete = false;
                    // wait for account selection
                    return new Promise(resolve => {

                        let listView = false;
                        AccountsList.get(device, (path, node) => {
                            if(!listView) {
                                this.emit(REQUEST_CONFIRM, {
                                    type: 'xpubAccountList',
                                    callback: submit => resolve(submit)
                                });
                                listView = true;
                            }
                            // update labels
                            this.emit(UPDATE_VIEW, xpubKeyLabel(path) );
                        }).then(list => {
                            // all accounts ready
                            accountListComplete = true;
                        }).catch(error => {
                            console.log("jerror", error);
                        });
                    });
                }

            })
            .then(submit => {
                // submit could be a boolean or number (index)
                if(typeof submit === 'boolean'){
                    if (submit) {
                        return this.device.session.getPublicKey(path);
                    } else {
                        // TODO: all errors should be stored in one place, not hardcoded
                        throw Error('Not confirmed');
                    }
                }else{
                    path = getPathFromIndex(submit);
                    console.warn("SUBM", submit, path, accountListComplete);
                    if(!accountListComplete) {
                        // break get list operation
                        AccountsList.interrupt = true;

                    }
                    //throw Error('Not confirmed');
                    //return new Promise(resolve => {});
                    return this.device.session.getPublicKey(path);
                }
            })
            .then(result => {
                let { xpub, node } = result.message;
                let serializedPath = getSerializedPath(path);

                return this.releaseDevice({
                    success: true,
                    xpubkey: xpub,
                    chainCode: node.chain_code,
                    publicKey: node.public_key,
                    path,
                    serializedPath
                });
            })
            .catch(error => {
                return this.releaseDevice({
                    success: false,
                    message: error.message
                });
            });
    }












    /**
     * Method
     *
     * @param {Object} description
     * @returns {Promise.<Object>}
     */
    async getAccountInfo(description: any): Promise<Object> {

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

    async getAccountById(device, id): Promise<Object> {
        return await Account.fromDevice(device, id, createCryptoChannel(), createBlockchain())
            .then(node => {
                //console.log("GetAcc", device.getNode);
            });
    }


    /*###################################################
    # Local methods to communicate with device
    ###################################################*/

    async initDevice({emptyPassphrase} = {}): Promise<Device> {
        return await this.initTransport()
            .then(list => resolveAfter(500, list))
            .then(list => this.waitForFirstDevice(list))
            .then(device => {
                this.device = device;

                device.session.on('button', this.onDeviceButtonHandler.bind(this));
                device.session.on('pin', this.onDevicePinHandler.bind(this));

                if(emptyPassphrase){
                    device.session.on('passphrase', callback => {
                        console.log("TODO: handle empty pass!")
                    });
                }else{
                    device.session.on('passphrase', this.onDevicePassphraseHandler.bind(this));
                }

                return device;
            })
            // if error handler will catch not resolveable promise (such as NO_TRASPORT)
            // will emit alert with screen id
            .catch(errorHandler(alert => this.emit(SHOW_COMPONENT, alert)));
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
                list.on('transport', (a) => {
                    console.warn("ontransport", a);
                })
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
                alert => this.emit(SHOW_COMPONENT, alert)
            ));
        } catch (error) {
            throw error;
        }
    }


    async releaseDevice(response: Object): Promise<any> {

        if(!this.device){
            return response;
        }

        this.device.session.removeListener('button', this.onDeviceButtonHandler);
        this.device.session.removeListener('pin', this.onDevicePinHandler);
        this.device.session.removeListener('passphrase', this.onDevicePassphraseHandler);

        this.device.release();
        return await this.device.session.release().then(() => {
            return response;
        });
    }

    async getAccountsNodes(callback: Function) {
        let list = [];
        return await [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].reduce(
            (promise: Promise<any>, current: number) => {
                return promise.then(hdnode => {
                    let path = getPathFromIndex(current);
                    return this.device.getNode(path)
                    .then( (node: HDNode) => {
                        list.push(node);
                        // wait for callback
                        // it could return immediately when account discovery is not needed
                        // or it could wait for account discovery result
                        console.log("getAccoutnNodes", path);
                        return callback(path, node, list);
                    });
                });
            },
            Promise.resolve()
        );
    }

    /*###################################################
    # Device events handlers
    ###################################################*/

    onDevicePassphraseHandler(a, b) {
        console.log("PASSphrase handler - show form!", a, b);
        //this.emit(REQUEST_PASSPHRASE);
    }

    onDeviceButtonHandler(code: string): void {
        console.log("onDeviceButtonHandler", code)

        const receive = (type) => {
            this.device.session.removeListener('receive', receive);
            this.device.session.removeListener('error', receive);
            //this.emit(SHOW_COMPONENT, 'global');
        };

        this.device.session.on('receive', receive); // unnecessary? after 1st confirm (host) will receive 'pin' event
        this.device.session.on('error', receive);

        // ButtonRequest_Other (verifyMessage)

        switch (code) {
            case 'ButtonRequest_ConfirmOutput':
            case 'ButtonRequest_SignTx':
                this.emit(SHOW_COMPONENT, 'confirm_tx');
                break;
            default:
                this.emit(SHOW_COMPONENT, 'confirm')
                break;
        }
    }

    onDevicePinHandler(type: string, callback: Function): void {
        console.log("onDevicePinHandler", type)

        this.emit(REQUEST_PIN, callback);
    }
}
