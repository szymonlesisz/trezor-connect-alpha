/* @flow */
'use strict';

import Device from '../device/Device';
import DeviceList from '../device/DeviceList';
import * as DeviceError from '../errors/DeviceError';

// TODO - put into config
const REQUIRED_FIRMWARE = '1.5.1';

const getDeviceDiverseState = (device: Device): ?Error => {
    if (device.isBootloader()) {
        return DeviceError.DEVICE_IN_BOOTLOADER;
    } else if (!device.isInitialized()) {
        return DeviceError.DEVICE_NOT_INITIALIZED;
    } else if(!device.atLeast(REQUIRED_FIRMWARE)) {
        return DeviceError.DEVICE_OLD_FIRMWARE;
    }
    return null;
}

export const getAcquiredDevice = async (list: DeviceList): Promise<?AcquiredDevice> => {
    const devices: Array<Device> = list.asArray();
    let device: Device;
    for (device of devices) {
        let diverseState: ?Error;
        if (device.isUsedHere()) {
            diverseState = getDeviceDiverseState(device);
            if (diverseState)
                throw diverseState;

            return new AcquiredDevice(device);
        }
    }
}

export const acquireDevice = async (list: DeviceList, descriptorPath:?string = null, rejectOnEmpty: boolean = false): Promise<AcquiredDevice> => {
    //if (list.hasDeviceOrUnacquiredDevice()

    console.log("acquireDevice", typeof descriptorPath === "string");
    console.log("acquireDevice", descriptorPath, list.devices);
    if (typeof descriptorPath === "string") {
        let device: Device = list.devices[descriptorPath];
        if (device) {
            console.log("ACC", device);
            const session: ?string = list.sessions[descriptorPath];
        }
    }
}

export class AcquiredDevice {

    constructor(device: Device) {

    }
}
