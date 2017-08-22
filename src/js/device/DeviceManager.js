import semvercmp from 'semver-compare';
import * as bitcoin from 'bitcoinjs-lib-zcash';

import * as DeviceError from '../errors/DeviceError';
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
            rememberDevicePassphrase: true,
            debug: false
        });

    await new Promise((resolve, reject) => {
        const onTransport = event => {
            removeListeners();
            resolve(true);
        }

        const onTransportError = error => {
            removeListeners();
            reject(DeviceError.NO_TRANSPORT);
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

const getDeviceDiverseState = (device) => {
    if (device.isBootloader()) {
        return DeviceError.DEVICE_IN_BOOTLOADER;
    } else if (!device.isInitialized()) {
        return DeviceError.DEVICE_NOT_INITIALIZED;
    } else if(!device.atLeast(REQUIRED_FIRMWARE)) {
        return DeviceError.DEVICE_OLD_FIRMWARE;
    }
    return false;
}

export const getAcquiredDevice = async (list: DeviceList): ConnectedDevice => {
    const devices = list.asArray();
    for (let dev of devices) {
        if (dev.isUsedHere()) {
            let diverseState = getDeviceDiverseState(dev);
            if (diverseState) {
                throw diverseState;
            } else {
                return new ConnectedDevice(dev.currentSessionObject, dev);
            }
        } else if( dev.isUsedElsewhere()) {
            await dev.steal();
            const { device, session } = await list.acquireFirstDevice(true);
            return new ConnectedDevice(session, device);
        }
    }
    return null;
}

export const acquireFirstDevice = async (list: DeviceList, rejectOnEmpty: boolean = false): Promise<any> => {
    try {
        const { device, session } = await list.acquireFirstDevice(rejectOnEmpty);
        let diverseState = getDeviceDiverseState(device);
        if (diverseState) {
            throw diverseState;
        } else {
            return new ConnectedDevice(session, device);
        }
    } catch (error) {
        throw error;
    }
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
        return !this.features.initialized;
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
