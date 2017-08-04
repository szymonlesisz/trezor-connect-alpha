// @flow
'use strict';

import 'whatwg-fetch';
import 'unorm';

import link from 'trezor-link';
import DeviceList from './device/device-list';

const {Bridge, Extension, Lowlevel, WebUsb, Fallback} = link;

export {default as Session} from './device/session';
export {default as UnacquiredDevice} from './device/unacquired-device';
export {default as Device} from './device/device';
export {default as DescriptorStream} from './utils/descriptor-stream';
export {default as DeviceList} from './device/device-list';

let sharedWorkerFactory: () => SharedWorker = () => { throw new Error('Shared worker not set.'); };
export function setSharedWorkerFactory(swf: () => SharedWorker) {
    sharedWorkerFactory = swf;
}

DeviceList._setTransport(() => new Fallback([new Extension(), new Bridge(), new Lowlevel(new WebUsb(), () => sharedWorkerFactory())]));

import {setFetch as installersSetFetch} from './utils/installers';
DeviceList._setFetch(window.fetch);
installersSetFetch(window.fetch);

export {
    installers,
    latestVersion,
    udevInstallers,
} from './utils/installers';

export type {
    Features,
    CoinType,
    LoadDeviceSettings,
    ResetDeviceSettings,
    RecoverDeviceSettings,
} from './utils/trezortypes';

export type {
    BridgeInstaller,
    UdevInstaller,
} from './utils/installers';

export type {
    TxInfo as TransactionToSign,
    OutputInfo as OutputToSign,
    InputInfo as InputToSign,
} from './utils/signbjstx';

export type {
    RunOptions,
} from './device/device';
