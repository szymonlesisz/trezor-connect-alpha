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
    creatingDevices: {[k: string]: boolean} = {};
    releaseAfterConnect: boolean = true;

    constructor(options: ?DeviceListOptions) {
        super();
        this.options = options || {};
        if (!this.options.transport) {
            this.options.transport = new Fallback([
                new Extension(), // Ext ID in Datamanager?
                //new Bridge(null, `latest.txt?${Date.now()}`), // TODO: from DataManager
                new Bridge(null, `${ DataManager.getSettings('latest_bridge_src') }?${ Date.now() }`), // TODO: from DataManager
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

        if (this.options.config) {
            logger.debug('Configuring transports: config from options');
            await transport.configure(this.options.config); // TODO!!
        } else {
            logger.debug('Configuring transports: config from fetch');
            const url: string = DataManager.getSettings('transport_config_src');
            try {
                const config: string = await httpRequest(`${ url }?${ Date.now() }`, 'text');
                await transport.configure(config);
            } catch(error) {
                throw ERROR.WRONG_TRANSPORT_CONFIG;
            }
        }
    }

    setReleaseAfterConnect(release: boolean): void {
        this.releaseAfterConnect = release;
    }

    /**
     * Transport events handler
     * @param {Transport} transport
     * @memberof DeviceList
     */
    async _initStream(): Promise<void> {
        const stream: DescriptorStream = new DescriptorStream(this.transport);

        stream.on(DEVICE.UPDATE, (diff: DeviceDescriptorDiff): void => {

            logger.debug("Update DescriptorStream", diff);

            diff.descriptors.forEach((descriptor: DeviceDescriptor) => {
                const path: string = descriptor.path.toString();
                const device: Device = this.devices[path];
                if (device) {
                    device.updateDescriptor(descriptor);
                }
            });

            const events: Array<{d: Array<DeviceDescriptor>, e: string}> = [
                {
                    d: diff.changedSessions,
                    e: DEVICE.CHANGED,
                }, {
                    d: diff.acquired,
                    e: DEVICE.ACQUIRED,
                }, {
                    d: diff.released,
                    e: DEVICE.RELEASED,
                },
            ];

            events.forEach(({d, e}: {d: Array<DeviceDescriptor>, e: string}) => {
                d.forEach((descriptor: DeviceDescriptor) => {
                    const path: string = descriptor.path.toString();
                    const device: Device = this.devices[path];
                    logger.debug("Event", e, device);
                    if (device) {
                        this.emit(e, device.toMessageObject());
                    }
                });
            });


            diff.connected.forEach(async (descriptor: DeviceDescriptor) => {
                const path: string = descriptor.path.toString();
                logger.debug("Connected", descriptor.session, this.devices);
                if (descriptor.session == null) {
                    await this._createAndSaveDevice(this.transport, descriptor);
                } else {
                    const device: Device = await this._createUnacquiredDevice(this.transport, descriptor);
                    this.devices[path] = device;
                    this.emit(DEVICE.CONNECT_UNACQUIRED, device.toMessageObject());
                }
            });

            diff.acquired.forEach(async (descriptor: DeviceDescriptor) => {
                const path: string = descriptor.path.toString();
                const device: Device = this.devices[path];
                if (device) {
                    if (!device.isUnacquired()) {
                        this.emit(DEVICE.USED_ELSEWHERE, device.toMessageObject());
                    }
                }
            });

            diff.released.forEach(async (descriptor: DeviceDescriptor) => {
                const path: string = descriptor.path.toString();
                const device: Device = this.devices[path];
                if (device) {
                    if (device.isUnacquired()) {
                        // wait for publish changes
                        await resolveAfter(501, null);
                        await this._createAndSaveDevice(this.transport, descriptor);
                    } else {
                        this.emit(DEVICE.USED_ELSEWHERE, device.toMessageObject());
                    }
                }
            });

            diff.disconnected.forEach((descriptor: DeviceDescriptor) => {
                const path: string = descriptor.path.toString();
                const device: Device = this.devices[path];
                if (device != null) {
                    device.disconnect();
                    delete this.devices[path];
                    this.emit(DEVICE.DISCONNECT, device.toMessageObject());
                }
            });

            this.emit(DEVICE.UPDATE, diff);
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
        transport: Transport,
        descriptor: DeviceDescriptor
    ): Promise<void> {
        logger.debug('Creating Device', descriptor);

        const path = descriptor.path.toString();
        this.creatingDevices[path] = true;

        let device: ?Device;
        try {
            device = await Device.fromDescriptor(transport, descriptor);
            this.devices[path] = device;
            await device.run(undefined, {
                releaseAfterConnect: this.releaseAfterConnect
            });
            this.releaseAfterConnect = true;
            this.emit(DEVICE.CONNECT, device.toMessageObject());
        } catch (error) {
            logger.debug('Cannot create device', error);
            if (error.message === ERROR.WRONG_PREVIOUS_SESSION_ERROR_MESSAGE) {
                let existed: ?Device = this.devices[path];
                if (existed instanceof Device && !existed.isUnacquired()) {
                    existed.disconnect(); // TODO: is it necessary?
                    delete this.devices[path];
                    existed = null;
                }
                if(existed === null) {
                    device = await this._createUnacquiredDevice(transport, descriptor);
                    this.devices[path] = device;
                } else {
                    device = existed;
                }
                if (device)
                    this.emit(DEVICE.CONNECT_UNACQUIRED, device.toMessageObject());
            } else if(error.message === ERROR.DEVICE_USED_ELSEWHERE.message) {
                device = await this._createUnacquiredDevice(transport, descriptor);
                this.devices[path] = device;
                this.emit(DEVICE.CONNECT_UNACQUIRED, device.toMessageObject());
            } else {
                this._createAndSaveDevice(transport, descriptor);
            }
        } finally {
            // clean up
            delete this.creatingDevices[path];
        }
    }


    async _createUnacquiredDevice(
        transport: Transport,
        descriptor: DeviceDescriptor
    ): Promise<Device> {
        logger.debug('Creating Unacquired Device', descriptor);
        try {
            return await Device.createUnacquired(transport, descriptor);
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
        //return objectValues(this.devices);
        let list: Array<DeviceDescription> = [];
        for (let [key, dev] of Object.entries(this.devices)) {
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
            // $FlowIssue
            const activeName: string = this.transport.activeName;
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
