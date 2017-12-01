/* @flow */
'use strict';

import EventEmitter from 'events';
import * as DEVICE from '../constants/device';
import * as ERROR from '../constants/errors';
import DescriptorStream from './DescriptorStream';
import type { DeviceDescriptorDiff } from './DescriptorStream';
//import Device from './Device';
import Device from './Device';
import type { DeviceDescription } from './Device';
import { Bridge, Extension, Fallback } from 'trezor-link';
import type { Transport, TrezorDeviceInfoWithSession as DeviceDescriptor } from 'trezor-link';
import DataManager from '../data/DataManager';
import Log, { init as initLog } from '../utils/debug';
import { resolveAfter } from '../utils/promiseUtils';
import { httpRequest } from '../utils/networkUtils';

export type DeviceListOptions = {
    debug?: boolean;
    debugInfo?: boolean;
    transport?: Transport;
    nodeTransport?: Transport;
    configUrl?: string;
    config?: string;
    bridgeVersionUrl?: string;
    clearSession?: boolean;
    clearSessionTime?: number;
    rememberDevicePassphrase?: boolean;
};

// custom log
const logger: Log = initLog('DeviceList', false);

export default class DeviceList extends EventEmitter {
    options: DeviceListOptions;
    transport: Transport;
    stream: DescriptorStream;
    devices: {[k: string]: Device} = {};
    creatingDevicesDescriptors: {[k: string]: DeviceDescriptor} = {};

    constructor(options: ?DeviceListOptions) {
        super();
        this.options = options || {};
        if (!this.options.transport) {
            const bridgeLatestSrc: string = `${ DataManager.getSettings('latest_bridge_src') }?${ Date.now() }`;
            this.options.transport = new Fallback([
                new Extension(), // Ext ID in Datamanager?
                new Bridge(null, bridgeLatestSrc),
            ]);
        }
        if (this.options.debug === undefined) {
            this.options.debug = true; //DataManager.getDebugSettings('deviceList');
        }
    }

    async init(): Promise<void> {
        try {
            this.transport = await this._initTransport();
            await this._initStream();
        } catch(error) {
            throw error;
        }
    }

    async _initTransport(): Promise<Transport> {
        const transport = this.options.transport;
        if (!transport) throw ERROR.NO_TRANSPORT;
        logger.debug('Initializing transports');
        //await transport.init( DataManager.getDebugSettings('transport') );
        await transport.init(false);
        logger.debug('Configuring transports');
        await this._configTransport(transport);
        logger.debug('Configuring transports done');
        return transport;
    }

    async _configTransport(transport: Transport): Promise<void> {

        if (typeof this.options.config === 'string') {
            logger.debug('Configuring transports: config from options');
            await transport.configure(this.options.config); // TODO!!
        } else {
            logger.debug('Configuring transports: config from fetch');
            const url: string = `${ DataManager.getSettings('transport_config_src') }?${ Date.now() }`;
            try {
                const config: string = await httpRequest(url, 'text');
                await transport.configure(config);
            } catch(error) {
                throw ERROR.WRONG_TRANSPORT_CONFIG;
            }
        }
    }

    /**
     * Transport events handler
     * @param {Transport} transport
     * @memberof DeviceList
     */
    async _initStream(): Promise<void> {
        const stream: DescriptorStream = new DescriptorStream(this.transport);

        stream.on(DEVICE.UPDATE, (diff: DeviceDescriptorDiff): void => {
            new DiffHandler(this, diff).handle();
        });

        stream.on(DEVICE.ERROR, (error: Error) => {
            this.emit(DEVICE.ERROR, error);
            stream.stop();
        });

        stream.listen();
        this.stream = stream;

        this.emit(DEVICE.STREAM, stream);
    }

    async _createAndSaveDevice(
        descriptor: DeviceDescriptor
    ): Promise<void> {
        logger.debug('Creating Device', descriptor);
        await new CreateDeviceHandler(descriptor, this).handle();
    }


    async _createUnacquiredDevice(
        descriptor: DeviceDescriptor
    ): Promise<Device> {
        logger.debug('Creating Unacquired Device', descriptor);
        try {
            return await Device.createUnacquired(this.transport, descriptor);
        } catch(error) {
            throw error;
        }
    }

    getDevice(path: string): Device {
        return this.devices[path];
    }

    getFirstDevicePath(): string {
        //const first = this.asArray()[0];
        //return this.devices[first.path];
        //const arr: Array<Object> =
        return this.asArray()[0].path;
    }

    asArray(): Array<DeviceDescription> {
        let list: Array<DeviceDescription> = [];
        for (let [key, dev]: [ string, any ] of Object.entries(this.devices)) {
            list.push(dev.toMessageObject());
        }
        return list;
    }

    length(): number {
        return this.asArray().length;
    }

    // for mytrezor - returns "bridge" or "extension", or something else :)
    transportType(): string {
        if (this.transport == null) {
            return '';
        }
        if (this.transport.activeName) {
            const activeName: any = this.transport.activeName;
            if (activeName === 'BridgeTransport') {
                return 'bridge';
            }
            if (activeName === 'ExtensionTransport') {
                return 'extension';
            }
            return activeName;
        }
        return this.transport.name;
    }

    transportVersion(): string {
        if (this.transport == null) {
            return '';
        }
        return this.transport.version;
    }

    transportOutdated(): boolean {
        if (this.transport == null) {
            return false;
        }
        if (this.transport.isOutdated) {
            return true;
        }
        return false;
    }

    onbeforeunload(clearSession?: ?boolean) {
        //this.asArray().forEach(device => device.onbeforeunload());
    }
}

function objectValues<X>(object: {[key: string]: X}): Array<X> {
    return Object.keys(object).map(key => object[key]);
}


/**
 * DeviceList initialization
 * returns instance of DeviceList
 * @returns {Promise<DeviceList>}
 */
export const getDeviceList = async (): Promise<DeviceList> => {
    const list = new DeviceList({
        rememberDevicePassphrase: true,
    });
    try {
        await list.init();
        return list;
    } catch(error) {
        console.error("INITERROR", error);
        throw ERROR.NO_TRANSPORT;
    }
}

// Helper class for creating new device
class CreateDeviceHandler {
    descriptor: DeviceDescriptor;
    list: DeviceList;
    path: string;

    constructor(descriptor: DeviceDescriptor, list: DeviceList) {
        logger.debug('Creating Device', descriptor);
        this.descriptor = descriptor;
        this.list = list;
        this.path = descriptor.path.toString();
    }

    // main logic
    async handle() {
        // creatingDevicesDescriptors is needed, so that if *during* creating of Device,
        // other application acquires the device and changes the descriptor,
        // the new unacquired device has correct descriptor
        this.list.creatingDevicesDescriptors[this.path] = this.descriptor;

        try {
            // "regular" device creation
            await this._takeAndCreateDevice();
        } catch (error) {
            logger.debug('Cannot create device', error);

            // if (error.message === ERROR.WRONG_PREVIOUS_SESSION_ERROR_MESSAGE) {
            //    // this should not happen actually
            //    // await this._handleWrongSession();
            // } else
            if (error.message === ERROR.DEVICE_USED_ELSEWHERE.message) {
                // most common error - someone else took the device at the same time
                await this._handleUsedElsewhere();
            } else {
                await resolveAfter(501, null);
                await this.handle();
            }
        }
        delete this.list.creatingDevicesDescriptors[this.path];
    }

    async _takeAndCreateDevice(): Promise<void> {
        const device = await Device.fromDescriptor(this.list.transport, this.descriptor);
        this.list.devices[this.path] = device;
        await device.run();
        this.list.emit(DEVICE.CONNECT, device.toMessageObject());
    }

    async _handleUsedElsewhere() {
        const device = await this.list._createUnacquiredDevice(this.list.creatingDevicesDescriptors[this.path]);
        this.list.devices[this.path] = device;
        this.list.emit(DEVICE.CONNECT_UNACQUIRED, device.toMessageObject());
    }
}

// Helper class for actual logic of handling differences
class DiffHandler {
    list: DeviceList;
    diff: DeviceDescriptorDiff;

    constructor(list: DeviceList, diff: DeviceDescriptorDiff) {
        this.list = list;
        this.diff = diff;
    }

    handle() {
        logger.debug('Update DescriptorStream', this.diff);

        // note - this intentionaly does not wait for connected devices
        // createDevice inside waits for the updateDescriptor event
        this._createConnectedDevices();
        this._createReleasedDevices();
        this._signalAcquiredDevices();

        this._updateDescriptors();
        this._emitEvents();
        this._disconnectDevices();
    }

    _updateDescriptors() {
        this.diff.descriptors.forEach((descriptor: DeviceDescriptor) => {
            const path: string = descriptor.path.toString();
            const device: Device = this.list.devices[path];
            if (device) {
                device.updateDescriptor(descriptor);
            }
        });
    }

    _emitEvents() {
        const events: Array<{d: Array<DeviceDescriptor>, e: string}> = [
            {
                d: this.diff.changedSessions,
                e: DEVICE.CHANGED,
            }, {
                d: this.diff.acquired,
                e: DEVICE.ACQUIRED,
            }, {
                d: this.diff.released,
                e: DEVICE.RELEASED,
            },
        ];

        events.forEach(({d, e}: {d: Array<DeviceDescriptor>, e: string}) => {
            d.forEach((descriptor: DeviceDescriptor) => {
                const path: string = descriptor.path.toString();
                const device: Device = this.list.devices[path];
                logger.debug('Event', e, device);
                if (device) {
                    this.list.emit(e, device.toMessageObject());
                }
            });
        });
    }

    // tries to read info about connected devices
    async _createConnectedDevices() {
        for (const descriptor of this.diff.connected) {
            const path: string = descriptor.path.toString();
            logger.debug('Connected', descriptor.session, this.list.devices);
            if (descriptor.session == null) {
                await this.list._createAndSaveDevice(descriptor);
            } else {
                const device: Device = await this.list._createUnacquiredDevice(descriptor);
                this.list.devices[path] = device;
                this.list.emit(DEVICE.CONNECT_UNACQUIRED, device.toMessageObject());
            }
        }
    }

    _signalAcquiredDevices() {
        for (const descriptor of this.diff.acquired) {
            const path: string = descriptor.path.toString();
            if (this.list.creatingDevicesDescriptors[path]) {
                this.list.creatingDevicesDescriptors[path] = descriptor;
            }
        }
    }

    // tries acquire and read info about recently released devices
    async _createReleasedDevices() {
        for (const descriptor of this.diff.released) {
            const path: string = descriptor.path.toString();
            const device: Device = this.list.devices[path];
            if (device) {
                if (device.isUnacquired()) {
                    // wait for publish changes
                    await resolveAfter(501, null);
                    await this.list._createAndSaveDevice(descriptor);
                }
            }
        }
    }

    _disconnectDevices() {
        for (const descriptor of this.diff.disconnected) {
            const path: string = descriptor.path.toString();
            const device: Device = this.list.devices[path];
            if (device != null) {
                device.disconnect();
                delete this.list.devices[path];
                this.list.emit(DEVICE.DISCONNECT, device.toMessageObject());
            }
        }
    }
}
