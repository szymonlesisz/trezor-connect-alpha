import semvercmp from 'semver-compare';
import * as bitcoin from 'bitcoinjs-lib-zcash';

import DeviceList from '../device/DeviceList';
import { Bridge, Extension, Fallback } from 'trezor-link';
DeviceList._setTransport(() =>
    new Fallback(
        [
            new Extension(),
            new Bridge(),
        ]
    )
);

DeviceList._setFetch(window.fetch);

import { setFetch as installersSetFetch } from '../utils/installers';
installersSetFetch(window.fetch);

const REQUIRED_FIRMWARE = '1.5.1';

export const getDeviceList = async (): Promise<any> => {

    const list = new DeviceList({
            config: null,
            debug: false
        });

    await new Promise((resolve, reject) => {
        const onTransport = event => {
            removeListeners();
            resolve(true);
        }

        const onTransportError = error => {
            removeListeners();
            reject("NO_TRANSPORT");
        }

        const removeListeners = () => {
            list.removeListener('error', onTransportError);
            list.removeListener('transport', onTransport);
        }

        list.on('error', onTransportError);
        list.on('transport', onTransport);
        list.init();
    });

    return list;
}

export const getRequestedDevice = (list: DeviceList): ConnectedDevice => {
    const devices = list.asArray();
    for (let dev of devices) {
        if (dev.isUsedHere())
            return new ConnectedDevice(dev.currentSessionObject, dev);
    }
    return null;
}

export const acquireFirstDevice = async (list: DeviceList, rejectOnEmpty: boolean = false): Promise<any> => {
    try {
        const { device, session } = await list.acquireFirstDevice(rejectOnEmpty);
        console.log("Accu233", device, session);
        const connected = new ConnectedDevice(session, device);
        if(connected.isBootloader()){
            throw new Error("DEVICE_IS_BOOTLOADER");
        }else if(!connected.isInitialized()){
            throw new Error("DEVICE_IS_EMPTY");
        }else if(!connected.atLeast(REQUIRED_FIRMWARE)){
            throw new Error("FIRMWARE_IS_OLD");
        }
        return connected;
    } catch (error) {
        throw error;
    }
}

export const stealDevice = async (list: DeviceList): ConnectedDevice => {
    const device = await list.stealFirstDevice(false);
    let session;
    await device.run(s => { session = s });
    return new ConnectedDevice(session, device);
}



export class ConnectedDevice {

    device;
    session;
    features;
    pinCallback;

    constructor(session, device) {
        this.device = device;
        this.session = session;
        this.features = device.features;
    }

    setPinCallback(callback: Function) {
        this.pinCallback = callback;
    }

    getPinCallback(): Function {
        return this.pinCallback;
    }

    isBootloader() {
        return this.features.bootloader_mode;
    }

    isInitialized() {
        return this.features.initialized;
    }

    isLogged() {
        //return (this.features.pin_cached && this.features.passphrase_protection)
        // this.session.getFeatures().then(f => {
        //     console.log("FEAT", f);
        // })
        return (this.features.pin_cached)
    }

    getVersion() {
        return [
            this.features.major_version,
            this.features.minor_version,
            this.features.patch_version
        ].join('.');
    }

    atLeast(version) {
        return semvercmp(this.getVersion(), version) >= 0;
    }

    getCoin(name) {
        let coins = this.features.coins;
        for (let i = 0; i < coins.length; i++) {
            if (coins[i].coin_name === name) {
                return coins[i];
            }
        }
        throw new Error('Device does not support given coin type');
    }

    getNode(path) {
        return this.session.getPublicKey(path)
            .then(({message}) => bitcoin.HDNode.fromBase58(message.xpub));
    }

    release() {
        this.device.release();
        this.session.release();
    }
}
