// @flow
// why bluebird? https://github.com/petkaantonov/bluebird/tree/master/benchmark (4 times faster than es6-promise)
import Promise from 'bluebird';
import EventEmitter from '../events/EventEmitter';

//import * as hd from 'hd-wallet';

//import * as trezor from 'trezor.js';
// TODO: Remove it from library
//import config from '../utils/configSigned';
import config from '../utils/configSignedNotValid';

import ConnectedDevice from './ConnectedDevice';
import Account from './Account';

import Device from '../device/Device';
import DeviceList from '../device/DeviceList';

import { resolveAfter, errorHandler, NO_TRANSPORT, NO_CONNECTED_DEVICES, DEVICE_IS_BOOTLOADER, DEVICE_IS_EMPTY, FIRMWARE_IS_OLD } from '../utils/promiseUtils';


// 1.3.0 introduced HDNodeType.xpub field
// 1.3.4 has version2 of SignIdentity algorithm
const REQUIRED_FIRMWARE: string = '1.3.4';

//const NO_TRANSPORT = new Error('No trezor.js transport is available');
//const NO_CONNECTED_DEVICES = new Error('No connected devices');
//const DEVICE_IS_BOOTLOADER = new Error('Connected device is in bootloader mode');
//const DEVICE_IS_EMPTY = new Error('Connected device is not initialized');
//const FIRMWARE_IS_OLD = new Error('Firmware of connected device is too old');

export const SHOW_ALERT = 'SHOW_ALERT';
export const REQUEST_PIN = 'REQUEST_PIN';


export default class ConnectChannel extends EventEmitter {

    device: ConnectedDevice;

    constructor(){
        super();
    }

    /*###################################################
    # Public methods called from Popup or Node.js
    ###################################################*/

    /**
     * Method request for login signed by TREZOR
     *
     * @param {Object} args
     * @returns {Promise.<Object>}
     */
    async requestLogin(args: Object = {}): Promise<Object> {

        // TREZOR_POPUP_URL = 'http://localhost/popup.html';
        // TREZOR_POPUP_PATH = 'http://localhost/';
        // TREZOR_POPUP_ORIGIN = 'http://localhost';

        // TODO!
        // - description what is this request for
        let request = {
            identity: {
                proto: 'Proto',
                host: 'localhost2',
                index: 0
            },
            challengeHidden: '',
            challengeVisual: 'Foo?'
        };

        return await this.initDevice({ emptyPassphrase: true })
            .then(function signIdentity(device){
                return device.session.signIdentity(
                    request.identity,
                    request.challengeHidden,
                    request.challengeVisual
                ).catch( errorHandler(() => signIdentity(device)) );
            })
            .then(result => resolveAfter(1500, result))
            .then(result => { // success
                let { message } = result;
                let { public_key, signature } = message;

                //this.device.session.release();
                //this.device.onbeforeunload();
                // TODO: Fix Error: The action was interrupted by another application. (trezor-link)
                this.device.release();
                return this.device.session.release().then(() => {
                    return {
                        success: true,
                        public_key: public_key.toLowerCase(),
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


    async getAccountInfo(description: any) {


        return await this.initDevice()
            .then(device => {
                return this.getAccountById(device, 1);
            })
    }

    async getAccountById(device, id) {
        return await Account.fromDevice(device, id, createCryptoChannel(), createBlockchain())
            .then(node => {
                console.log("GetAcc", device.getNode);
            });
    }

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
                debug: false
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
