import semvercmp from 'semver-compare';
import * as bitcoin from 'bitcoinjs-lib-zcash';

import * as DeviceError from '../errors/DeviceError';
import DeviceList from '../device/DeviceList';

import { setFetch as installersSetFetch } from '../utils/installers';
installersSetFetch(window.fetch);





export const getAcquiredDevice = async (list: DeviceList): ConnectedDevice => {
    const devices = list.asArray();
    for (let dev of devices) {
        let diverseState;
        if (dev.isUsedHere()) {
            diverseState = getDeviceDiverseState(dev);
            if (diverseState) {
                throw diverseState;
            } else {
                return new ConnectedDevice(dev.currentSessionObject, dev);
            }
        } else if( dev.isUsedElsewhere()) {
            await dev.steal();
            diverseState = getDeviceDiverseState(dev);
            if (diverseState) {
                throw diverseState;
            } else {
                const { device, session } = await list.acquireFirstDevice(true);
                return new ConnectedDevice(session, device);
            }
        }
    }
    return null;
}

export const acquireFirstDevice = async (list: DeviceList, rejectOnEmpty: boolean = false): Promise<ConnectedDevice> => {
    try {
        const { device, session } = await list.acquireFirstDevice(rejectOnEmpty);
        let diverseState = getDeviceDiverseState(device);
        if (diverseState) {
            if(rejectOnEmpty) {
                device.release();
                session.release();
            }
            throw diverseState;
        } else {
            return new ConnectedDevice(session, device);
        }
    } catch (error) {
        throw error;
    }
}

const findDeviceIndexByID = (devices:Array<any>, deviceID:string = null): number => {
    if (deviceID === null && devices.length > 0) return 0;
    for (let [ index, dev ] of devices.entries() ) {
        if (dev.features.device_id === deviceID) {
            return index;
        }
    }
    return -1;
}

export const getAcquiredDeviceNew = async (devices:Array<any>, deviceID:string = null): ConnectedDevice => {
    let devIndex = findDeviceIndexByID(devices, deviceID);
    let device = devices[devIndex];
    if (device.isUsedHere()) {
        return device;
    } else {
        console.log("is used elsewhere")
        await device.steal();
        // let s = await device.run(session => {
        //     console.log("device run!!!", session);
        //     //resolve({device, session});
        //     // this "inside" promise never resolves or rejects
        //     //return new Promise((resolve, reject) => {});
        // });
        return device;

    }
}

export const acquireDevice = async (list: DeviceList, deviceID:string = null, rejectOnEmpty: boolean = false): Promise<ConnectedDevice> => {
    //return new Promise((resolve, reject) => {
        let devices = list.asArray();
        if (devices.length > 0) {
            let dev = await getAcquiredDevice(devices, deviceID);
            if (!dev.currentSessionObject) {
                let sess = null;
                console.log("SESSION EMPTY")
                await dev.run(session => {
                    sess = session;
                    console.log("onrun!");
                });
                console.log("ACCSESS", sess);
                return new ConnectedDevice(sess, dev);
            } else {
                return new ConnectedDevice(dev.currentSessionObject, dev)
            }
            console.log("DEVVV", dev)
        }
    //});


    // if (dev) {
    //     const session = await dev.run(session => {
    //         console.log("--acquireDevice1b", session);
    //         // return new ConnectedDevice(session, dev);
    //         // return new Promise((resolve, reject) => {});
    //     })
    // }


    /*
    console.log("--acquireDevice2");
    dev = findDeviceByID(list.unacquiredAsArray(), deviceID);
    if (dev) {
        await dev = dev.steal();
            return dev.run(session => {
                return new ConnectedDevice(session, dev);
            });
        }).catch(error => {
            console.error(error);
            throw error;
        });
    }
    */
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
