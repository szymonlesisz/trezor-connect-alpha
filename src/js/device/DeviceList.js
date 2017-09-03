/* @flow */
'use strict';
import EventEmitter from 'events';
import * as DeviceListEvents from '../events/DeviceListEvents';
import { NO_TRANSPORT } from '../errors/DeviceError';
import DescriptorStream from './DescriptorStream';
import type { DeviceDescriptorDiff } from './DescriptorStream';
//import Device from './Device';
import Device from './Device';
import Session from './Session';
import UnacquiredDevice from './UnacquiredDevice';
import { Bridge, Extension, Fallback } from 'trezor-link';
import type { Transport, TrezorDeviceInfoWithSession as DeviceDescriptor } from 'trezor-link';


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

const CONFIG_URL = 'https://wallet.trezor.io/data/config_signed.bin';
// a slight hack
// this error string is hard-coded
// in both bridge and extension
const WRONG_PREVIOUS_SESSION_ERROR_MESSAGE = 'wrong previous session';

const debug = (...args) => {
    console.log.apply(this, args);
}

export default class DeviceList extends EventEmitter {

    options: DeviceListOptions;
    transport: Transport;
    sessions: {[path: string]: ?string} = {};
    stream: ?DescriptorStream = null;

    devices: {[k: string]: Device} = {};
    unacquiredDevices: {[k: string]: UnacquiredDevice} = {};

    creatingDevices: {[k: string]: boolean} = {};

    constructor(options: ?DeviceListOptions) {
        super();
        this.options = options || {};
        if (!this.options.transport) {
            this.options.transport = new Fallback([
                new Extension(),
                //new Bridge(),
            ]);
        }
    }

    async init(): Promise<void> {
        try {
            this.transport = await this._initTransport();
            this._initStream(this.transport);
        } catch(error) {
            throw error;
        }
    }

    async _initTransport(): Promise<Transport> {
        const transport = this.options.transport;
        if (!transport) return null;
        debug('[trezor.js] [device list] Initializing transports');
        await transport.init(this.options.debug);
        debug('[trezor.js] [device list] Configuring transports');
        await this._configTransport(transport);
        debug('[trezor.js] [device list] Configuring transports done');
        return transport;
    }

    async _configTransport(transport: Transport): Promise<void> {
        if (this.options.config != null) {
            await transport.configure(this.options.config);
        } else {
            const configUrl: string = (this.options.configUrl == null)
                ? (CONFIG_URL + '?' + Date.now())
                : this.options.configUrl;
            const fetch = window.fetch; // TODO to external param
            const response = await fetch(configUrl);

            if (!response.ok) {
                throw new Error('Wrong config response.');
            }
            const config = await response.text();
            await transport.configure(config);
        }
    }

    /**
     * Transport events handler
     * @param {Transport} transport
     * @memberof DeviceList
     */
    _initStream(transport: Transport): void {
        const stream: DescriptorStream = new DescriptorStream(transport);

        stream.updateEvent.on((diff: DeviceDescriptorDiff): void => {
            this.sessions = {};

            diff.descriptors.forEach((descriptor: DeviceDescriptor) => {
                this.sessions[descriptor.path.toString()] = descriptor.session;
            });

            const events: Array<{d: Array<DeviceDescriptor>, e: string}> = [
                {
                    d: diff.changedSessions,
                    e: DeviceListEvents.SESSION_CHANGED,
                }, {
                    d: diff.acquired,
                    e: DeviceListEvents.SESSION_ACQUIRED,
                }, {
                    d: diff.released,
                    e: DeviceListEvents.SESSION_RELEASED,
                },
            ];

            events.forEach(({d, e}: {d: Array<DeviceDescriptor>, e: string}) => {
                d.forEach((descriptor: DeviceDescriptor) => {
                    const path: string = descriptor.path.toString();
                    const device: Device = this.devices[path];
                    const unacquiredDevice: UnacquiredDevice = this.unacquiredDevices[path];
                    const session:?string = this.sessions[path];
                    this.emit(e, device, unacquiredDevice, session);
                });
            });


            diff.connected.forEach(async (descriptor: DeviceDescriptor) => {
                const path: string = descriptor.path.toString();
                if (descriptor.session == null) {
                    await this._createAndSaveDevice(transport, descriptor, stream);
                } else {
                    this.creatingDevices[path.toString()] = true;
                    const device: UnacquiredDevice = await this._createUnacquiredDevice(transport, descriptor, stream);
                    this.unacquiredDevices[path] = device;
                    delete this.creatingDevices[path];
                    this.emit(DeviceListEvents.CONNECT_UNACQUIRED, device);
                }
            });

            diff.disconnected.forEach((descriptor: DeviceDescriptor) => {
                const path: string = descriptor.path.toString();
                const device: Device = this.devices[path];
                if (device != null) {
                    delete this.devices[path];
                    this.emit(DeviceListEvents.DISCONNECT, device);
                }

                const unacquiredDevice: UnacquiredDevice = this.unacquiredDevices[path];
                if (unacquiredDevice != null) {
                    delete this.unacquiredDevices[path];
                    this.emit(DeviceListEvents.DISCONNECT_UNACQUIRED, unacquiredDevice);
                }
            });

            diff.acquired.forEach(async (descriptor: DeviceDescriptor) => {
                const path: string = descriptor.path.toString();
                const device: Device = this.devices[path];
                if (device) {
                    this.emit(DeviceListEvents.SESSION_STOLEN, device, device.isStolen());
                }
            });

            diff.released.forEach(async (descriptor: DeviceDescriptor) => {
                const path: string = descriptor.path.toString();
                const device: Device = this.devices[path];
                const unacquiredDevice: UnacquiredDevice = this.unacquiredDevices[path];
                if (unacquiredDevice != null) {
                    const previous = this.unacquiredDevices[path];
                    delete this.unacquiredDevices[path];
                    await this._createAndSaveDevice(transport, descriptor, stream, previous);
                } else if(device != null) {
                    this.emit(DeviceListEvents.SESSION_STOLEN, device, device.isStolen());
                }
            });

            this.emit(DeviceListEvents.UPDATE, diff);
        });

        stream.errorEvent.on((error: Error) => {
            this.emit(DeviceListEvents.ERROR, error);
            stream.stop();
        });

        stream.listen();

        this.stream = stream;
        this.emit(DeviceListEvents.STREAM, stream);
    }

    async _createAndSaveDevice(
        transport: Transport,
        descriptor: DeviceDescriptor,
        stream: DescriptorStream,
        previous: ?UnacquiredDevice
    ): Promise<void> {
        debug('[trezor.js] [device list] Creating Device', descriptor, previous);

        const path = descriptor.path.toString();
        this.creatingDevices[path] = true;

        let device: ?Device;
        let session: ?Session;
        try {
            console.warn("before session")
            session = await Session.fromDescriptor(transport, descriptor);

            //stream.setHard(path, session.getId());
            this.sessions[path] = session.getId();
            console.warn("before device")
            device = await Device.fromDescriptor(transport, descriptor, this, session);
            console.warn("after device")
            delete this.creatingDevices[path];
            this.devices[path] = device;
            this.emit(DeviceListEvents.CONNECT, device);

        } catch(error) {
            debug('[trezor.js] [device list] Cannot create device', error);
            if (error.message === WRONG_PREVIOUS_SESSION_ERROR_MESSAGE) {
                let unacquiredDevice: UnacquiredDevice;
                if (previous == null) {
                    unacquiredDevice = await this._createUnacquiredDevice(transport, descriptor, stream);
                    this.unacquiredDevices[path] = unacquiredDevice;
                } else {
                    unacquiredDevice = previous;
                    this.unacquiredDevices[previous.originalDescriptor.path.toString()] = unacquiredDevice;
                }
                delete this.creatingDevices[path];
                this.emit(DeviceListEvents.CONNECT_UNACQUIRED, unacquiredDevice);
            } else {
                this.emit(DeviceListEvents.ERROR, 'Cannot create device', error);
            }
        } finally {
            if (session) {
                session.release();
            }
        }
    }

    async _createUnacquiredDevice(
        transport: Transport,
        descriptor: DeviceDescriptor,
        stream: DescriptorStream
    ): Promise<UnacquiredDevice> {
        debug('[trezor.js] [device list] Creating Unacquired Device', descriptor);
        try {
            const device:UnacquiredDevice = await UnacquiredDevice.fromDescriptor(transport, descriptor, this);
            return device;
        } catch(error) {
            throw error;
        }
    }


    asArray(): Array<Device> {
        return objectValues(this.devices);
    }

    unacquiredAsArray(): Array<UnacquiredDevice> {
        return objectValues(this.unacquiredDevices);
    }

    hasDeviceOrUnacquiredDevice(): boolean {
        return ((this.asArray().length + this.unacquiredAsArray().length) > 0);
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











    getSession(path: string): ?string {
        return this.sessions[path];
    }

    setHard(path: string, session: ?string) {
        if (this.stream != null) {
            this.stream.setHard(path, session);
        }
        this.sessions[path] = session;
    }

    // TODO: remove those methods

    onUnacquiredConnect(
        unacquiredDevice: UnacquiredDevice,
        listener: (device: Device, unacquiredDevice: ?UnacquiredDevice) => void
    ): void {
        const path = unacquiredDevice.originalDescriptor.path.toString();
        if (this.unacquiredDevices[path] == null) {
            if (this.creatingDevices[path] != null) {
                this.on('connect', listener);
            } else if (this.devices[path] != null) {
                listener(this.devices[path], unacquiredDevice);
            }
        } else {
            this.on('connect', listener);
        }
    }

    onUnacquiredDisconnect(
        unacquiredDevice: UnacquiredDevice,
        listener: (unacquiredDevice: UnacquiredDevice) => void
    ): void {
        const path = unacquiredDevice.originalDescriptor.path.toString();
        if (this.unacquiredDevices[path] == null) {
            if (this.creatingDevices[path] != null) {
                this.on('disconnectUnacquired', listener);
            } else if (this.devices[path] == null) {
                listener(unacquiredDevice);
            }
        } else {
            this.on('disconnectUnacquired', listener);
        }
    }

    onDisconnect(
        device: Device,
        listener: (device: Device) => void
    ): void {
        const path = device.originalDescriptor.path.toString();
        if (this.devices[path] == null && this.creatingDevices[path] == null) {
            listener(device);
        } else {
            this.on('disconnect', listener);
        }
    }

    onbeforeunload(clearSession?: ?boolean) {
        this.asArray().forEach(device => device.onbeforeunload());
    }

}

function objectValues<X>(object: {[key: string]: X}): Array<X> {
    return Object.keys(object).map(key => object[key]);
}

export const getDeviceList = async (): Promise<any> => {
    const list = new DeviceList({
        rememberDevicePassphrase: true,
        debug: false
    });
    try {
        await list.init();
    } catch(error) {
        console.error("DeviceListinit Error", error)
        throw NO_TRANSPORT;
    }
    return list;
}
