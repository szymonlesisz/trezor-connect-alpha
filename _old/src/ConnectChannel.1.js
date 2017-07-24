

import EventEmitter from 'events';

import * as trezor from 'trezor.js';

// TODO: Remove it from library
import config from './config-signed';

import Device from './Device';
//import errorHandler from './ErrorHandler';
import { resolveAfter, errorHandler } from '../utils/promise-utils';

const NO_TRANSPORT = new Error('No trezor.js transport is available');
const NO_CONNECTED_DEVICES = new Error('No connected devices');
const DEVICE_IS_BOOTLOADER = new Error('Connected device is in bootloader mode');
const DEVICE_IS_EMPTY = new Error('Connected device is not initialized');
const FIRMWARE_IS_OLD = new Error('Firmware of connected device is too old');
const INSUFFICIENT_FUNDS = new Error('Insufficient funds');


export const SHOW_ALERT = 'SHOW_ALERT';
export const REQUEST_PIN = 'REQUEST_PIN';

export default class ConnectChannel extends EventEmitter {

    device;

    constructor(){
        super();
    }

    async requestLogin() {

        // window.TREZOR_POPUP_URL = 'http://localhost/popup.html';
        // window.TREZOR_POPUP_PATH = 'http://localhost/';
        // window.TREZOR_POPUP_ORIGIN = 'http://localhost';

        let request = {
            identity: {
                proto: '*',
                host: 'localhost',
                index: 0
            },
            challenge_hidden: '',
            challenge_visual: ''
        };

        //this.initDevice({ emptyPassphrase: true })
        return await this.initDevice()
            .then(function signIdentity(device){
                return device.session.signIdentity(
                    request.identity,
                    request.challenge_hidden,
                    request.challenge_visual
                ).catch( errorHandler(() => signIdentity(device)) );
            });
    }

    async initDevice({emptyPassphrase} = {}) {
        return await this.initTransport()
            .then(t => resolveAfter(500, t))
            .then(t => this.waitForFirstDevice(t))
            .then(device => {
                this.device = device;
                // let passphraseHandler = (emptyPassphrase)
                //         ? emptyPassphraseCallback
                //         : passphraseCallback;

                // device.session.on('passphrase', passphraseHandler);
                device.session.on('button', this.onDeviceButtonHandler.bind(this));
                device.session.on('pin', this.onDevicePinHandler.bind(this));


                return device;
            });
    }

    async initTransport(): Promise<any> {

        let result = await new Promise((resolve, reject) => {
            let list = new trezor.DeviceList({
                config: config,
                debug: false
            });

            const onTransport = () => {
                list.removeListener('error', onError);
                resolve(list);
            };
            const onError = () => {
                list.removeListener('transport', onTransport);
                reject(NO_TRANSPORT);
            };
            list.on('error', onError);
            list.on('transport', onTransport);
        });

        //return result.catch(errorHandler());
        return result;
    }


    async waitForFirstDevice(list): Promise<any> {
        let res;
        if (!(list.hasDeviceOrUnacquiredDevice())) {
            res = Promise.reject(NO_CONNECTED_DEVICES);
        } else {
            res = list.acquireFirstDevice(true)
                .then(({device, session}) => new Device(session, device))
                .then((device) => {
                    if (device.isBootloader()) {
                        throw DEVICE_IS_BOOTLOADER;
                    }
                    if (!device.isInitialized()) {
                        throw DEVICE_IS_EMPTY;
                    }
                    //if (!device.atLeast(requiredFirmware)) {
                    if (!device.atLeast('1.3.4')) {
                        // 1.3.0 introduced HDNodeType.xpub field
                        // 1.3.4 has version2 of SignIdentity algorithm
                        throw FIRMWARE_IS_OLD;
                    }
                    return device;
                })
        }

        return await res.catch(errorHandler(() => waitForFirstDevice(list)));
    }


    onDeviceButtonHandler(code) {
        console.log("onDeviceButtonHandler", code, this)

        const receive = (type) => {
            this.device.session.removeListener('receive', receive);
            this.device.session.removeListener('error', receive);
            //showAlert(global.alert);
            console.log("RECEIVE", type)
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

    onDevicePinHandler(type, callback){
        console.log("onDevicePinHandler", type, callback)

        this.emit(REQUEST_PIN, callback);
    }
}
