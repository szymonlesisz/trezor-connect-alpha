/* @flow */
'use strict';

import EventEmitter from 'events';
import semvercmp from 'semver-compare';
import DeviceCommands from './DeviceCommands';

import type { Features } from './trezorTypes';
import type { Transport, TrezorDeviceInfoWithSession as DeviceDescriptor } from 'trezor-link';

import * as DEVICE from '../constants/device';
import * as ERROR from '../constants/errors';
import { create as createDeferred } from '../utils/deferred';
import type { Deferred } from '../utils/deferred';

import Log, { init as initLog } from '../utils/debug';

const FEATURES_LIFETIME: number = 10 * 60 * 1000; // 10 minutes

// custom log
const logger: Log = initLog('Device');

export type RunOptions = {

    // releaseAfterConnect - on the first run (called from DeviceList) release session automatically
    //                       or hold session for future use (example: waiting for device popup)
    releaseAfterConnect?: boolean,

    // aggressive - stealing even when someone else is running things
    aggressive?: boolean,
    // skipFinalReload - normally, after action, features are reloaded again
    //                   because some actions modify the features
    //                   but sometimes, you don't need that and can skip that
    skipFinalReload?: boolean,
    // waiting - if waiting and someone else holds the session, it waits until it's free
    //          and if it fails on acquire (because of more tabs acquiring simultaneously),
    //          it tries repeatedly
    waiting?: boolean,
    onlyOneActivity?: boolean,

    // cancel popup request when we are sure that there is no need to authenticate
    // Method gets called after run() fetch new Features but before trezor-link dispatch "acquire" event
    cancelPopupRequest?: Function,
}

const parseRunOptions = (options?: RunOptions): RunOptions => {
    if (!options) options = {};
    options.releaseAfterConnect = typeof options.releaseAfterConnect === 'boolean' ? options.releaseAfterConnect : true;
    return options;
};

/**
 *
 *
 * @export
 * @class Device
 * @extends {EventEmitter}
 */
export default class Device extends EventEmitter {
    +transport: Transport;
    +originalDescriptor: DeviceDescriptor;
    features: Features;
    featuresNeedsReload: boolean = false;

    deferredActions: { [key: string]: Deferred<void> } = {};
    runPromise: ?Deferred<void>;

    loaded: boolean = false;
    firstRunPromise: Deferred<boolean>;

    activitySessionID: string;

    featuresTimestamp: number = 0;

    commands: DeviceCommands;

    cachedPassphrase: ?string;

    constructor(transport: Transport, descriptor: DeviceDescriptor) {
        super();

        // === immutable properties
        this.transport = transport;
        this.originalDescriptor = descriptor;

        // this will be released after first run
        this.firstRunPromise = createDeferred();
    }

    static async fromDescriptor(
        transport: Transport,
        originalDescriptor: DeviceDescriptor
    ): Promise<Device> {
        const descriptor = { ...originalDescriptor, session: null };
        try {
            const device: Device = new Device(transport, descriptor);
            return device;
        } catch (error) {
            logger.error('Device.fromDescriptor', error);
            throw error;
        }
    }

    static createUnacquired(
        transport: Transport,
        descriptor: DeviceDescriptor
    ): Device {
        return new Device(transport, descriptor);
    }

    async acquire(): Promise<void> {
        // will be resolved after trezor-link acquire event
        this.deferredActions[ DEVICE.ACQUIRE ] = createDeferred();

        const sessionID: string = await this.transport.acquire({
            path: this.originalDescriptor.path,
            previous: this.originalDescriptor.session,
            checkPrevious: true,
        });
        this.activitySessionID = sessionID;
        if (this.commands) {
            this.commands.dispose();
        }
        this.commands = new DeviceCommands(this, this.transport, sessionID);

        // future defer for trezor-link release event
        this.deferredActions[ DEVICE.RELEASE ] = createDeferred();
    }

    async release(): Promise<void> {
        if (this.isUsedHere()) {
            logger.debug('RELEASING');

            if (this.commands) {
                this.commands.dispose();
            }

            try {
                await this.transport.release(this.activitySessionID);
            } catch (err) {
                logger.debug('Error in release');
                logger.debug(err);
            }
        }
    }

    async run(
        fn?: () => Promise<void>,
        options?: RunOptions
    ): Promise<void> {
        if (this.runPromise) {
            // TODO: check if this method is called twice
            // wait or return nothing?
            logger.debug('++++++Wait for prev');
            // await this.runPromise.promise;
            logger.debug('TODO: is this will be called?');
            // throw new Error('Call in progress');
            throw ERROR.DEVICE_CALL_IN_PROGRESS;
        }

        options = parseRunOptions(options);

        this.runPromise = createDeferred(this._runInner.bind(this, fn, options));
        return this.runPromise.promise;
    }

    interruptionFromUser(error: Error): void {
        logger.debug('+++++interruptionFromUser');
        if (this.runPromise) {
            // reject inner defer
            this.runPromise.reject(error);
            this.runPromise = null;

            // release device
            if (this.deferredActions[ DEVICE.RELEASE ]) {
                this.release();
            }
        }

        if (this.commands) {
            this.commands.dispose();
        }
    }

    interruptionFromOutside(): void {
        logger.debug('+++++interruptionFromOutside');
        if (this.runPromise) {
            this.runPromise.reject(ERROR.DEVICE_USED_ELSEWHERE);
            this.runPromise = null;
        }

        if (this.commands) {
            this.commands.dispose();
        }
    }

    async _runInner<X>(
        fn?: () => Promise<X>,
        options: RunOptions
    ): Promise<any> {
        // acquire session
        await this.acquire();

        // update features
        await this.init();

        // try to cancel popup request, maybe it's not too late...
        if (this.isAuthenticated()) {
            this.emit(DEVICE.AUTHENTICATED);
        }

        // wait for event from trezor-link
        await this.deferredActions[ DEVICE.ACQUIRE ].promise;

        // call inner function
        if (fn) {
            await fn();
        }

        // await resolveAfter(2000, null);

        await this.release();
        // wait for release event
        if (this.deferredActions[ DEVICE.RELEASE ]) { await this.deferredActions[ DEVICE.RELEASE ].promise; }

        if (this.runPromise) { this.runPromise.resolve(); }
        this.runPromise = null;

        this.loaded = true;
        this.firstRunPromise.resolve(true);
    }

    getCommands(): DeviceCommands {
        return this.commands;
    }

    setPassphrase(pass: ?string): void {
        this.cachedPassphrase = pass;
    }

    getPassphrase(): ?string {
        return this.cachedPassphrase;
    }

    async init(): Promise<void> {
        // const { message } : { message: Features } = await this.typedCall('Initialize', 'Features');
        const { message } : { message: Features } = await this.commands.typedCall('Initialize', 'Features', {});
        this.features = message;
        this.featuresNeedsReload = false;
        this.featuresTimestamp = new Date().getTime();
    }

    async getFeatures(): Promise<void> {
        // const { message } : { message: Features } = await this.typedCall('GetFeatures', 'Features');
        const { message } : { message: Features } = await this.commands.typedCall('GetFeatures', 'Features', {});
        this.features = message;
    }

    async _reloadFeatures(): Promise<void> {
        if (this.atLeast('1.3.3')) {
            await this.getFeatures();
        } else {
            await this.init();
        }
    }

    isUnacquired(): boolean {
        return this.features === undefined;
    }

    async updateDescriptor(descriptor: DeviceDescriptor): Promise<void> {
        logger.debug('updateDescriptor', 'currentSession', this.originalDescriptor.session, 'upcoming', descriptor.session, 'lastUsedID', this.activitySessionID);

        if (descriptor.session === null) {
            // released
            if (this.originalDescriptor.session === this.activitySessionID) {
                // by myself
                logger.debug('RELEASED BY MYSELF');
                if (this.deferredActions[ DEVICE.RELEASE ]) {
                    this.deferredActions[ DEVICE.RELEASE ].resolve();
                    delete this.deferredActions[ DEVICE.RELEASE ];
                }
            } else {
                // by other application
                logger.debug('RELEASED BY OTHER APP');
                this.featuresNeedsReload = true;
            }
        } else {
            // acquired
            // TODO: Case where listen event will dispatch before this.transport.acquire (this.acquire) return ID
            if (descriptor.session === this.activitySessionID) {
                // by myself
                logger.debug('ACQUIRED BY MYSELF');
                if (this.deferredActions[ DEVICE.ACQUIRE ]) {
                    this.deferredActions[ DEVICE.ACQUIRE ].resolve();
                    // delete this.deferred[ DEVICE.ACQUIRE ];
                }
            } else {
                // by other application
                logger.debug('ACQUIRED BY OTHER');
                this.interruptionFromOutside();
            }
        }
        this.originalDescriptor = descriptor;
    }

    disconnect(): void {
        // TODO: cleanup everything
        logger.debug('DISCONNECT CLEANUP!');
        // don't try to release
        delete this.deferredActions[ DEVICE.RELEASE ];

        this.interruptionFromUser(new Error('Device disconnected'));

        this.runPromise = null;
    }

    isBootloader(): boolean {
        return this.features.bootloader_mode;
    }

    isInitialized(): boolean {
        return this.features.initialized;
    }

    getVersion(): string {
        return [
            this.features.major_version,
            this.features.minor_version,
            this.features.patch_version,
        ].join('.');
    }

    atLeast(version: string): boolean {
        return semvercmp(this.getVersion(), version) >= 0;
    }

    getCoin(name: string): Object {
        const coins = this.features.coins;

        for (let i = 0; i < coins.length; i++) {
            if (coins[i].coin_name === name) {
                return coins[i];
            }
        }
        throw new Error('Device does not support given coin type');
    }

    isUsed(): boolean {
        return this.originalDescriptor.session != null;
    }

    isUsedHere(): boolean {
        return this.originalDescriptor.session != null && this.originalDescriptor.session === this.activitySessionID;
    }

    isUsedElsewhere(): boolean {
        return this.isUsed() && !(this.isUsedHere());
    }

    isRunning(): boolean {
        return !!(this.runPromise);
    }

    isLoaded(): boolean {
        return this.loaded;
    }

    waitForFirstRun(): Promise<boolean> {
        return this.firstRunPromise.promise;
    }

    getDevicePath(): string {
        return this.originalDescriptor.path;
    }

    isAuthenticated(): boolean {
        if (this.isUnacquired() || this.isUsedElsewhere() || this.featuresNeedsReload) return false;
        if (new Date().getTime() - this.featuresTimestamp > FEATURES_LIFETIME) return false;

        const pin: boolean = this.features.pin_protection ? this.features.pin_cached : true;
        let pass: boolean = this.features.passphrase_protection ? this.features.passphrase_cached : true;
        if (typeof this.cachedPassphrase === 'string') pass = true;
        logger.debug('isAuthenticated', pin, pass, this.cachedPassphrase);
        return (pin && pass);
    }

    onbeforeunload() {
        // Szymon tmp fix
        // this.release();

        // const currentSession = this.currentSessionObject;
        // if (currentSession != null) {
        //     // cannot run .then() in browser; so let's just fire and hope for the best
        //     if (this.clearSession) {
        //         currentSession.clearSession();
        //     }
        //     currentSession.release();
        // }
    }

    // simplified object to pass via postMessage
    toMessageObject(): DeviceDescription {
        const defaultLabel: string = 'My TREZOR';
        if (this.isUnacquired()) {
            return {
                path: this.originalDescriptor.path,
                label: defaultLabel,
                isUsedElsewhere: this.isUsedElsewhere(),
                featuresNeedsReload: this.featuresNeedsReload,
                unacquired: true,
            };
        } else {
            const label = this.features.label !== '' ? this.features.label : defaultLabel;
            return {
                path: this.originalDescriptor.path,
                label: label,
                isUsedElsewhere: this.isUsedElsewhere(),
                featuresNeedsReload: this.featuresNeedsReload,
            };
        }
    }
}

export type DeviceDescription = {
    path: string,
    label: string,
    isUsedElsewhere: boolean,
    featuresNeedsReload: boolean,
    unacquired?: boolean,
}
