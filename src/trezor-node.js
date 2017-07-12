// @flow
'use strict';

import 'unorm';

import link from 'trezor-link-node';
import DeviceList from './device/device-list';

const {Bridge, Fallback, Lowlevel, NodeHid} = link;

export {default as Session} from './device/session';
export {default as UnacquiredDevice} from './device/unacquired-device';
export {default as Device} from './device/device';
export {default as DescriptorStream} from './device/descriptor-stream';
export {default as DeviceList} from './device/device-list';

const fetch = require('node-fetch');
DeviceList._setTransport(() => new Fallback([new Bridge(), new Lowlevel(new NodeHid())]));

import {setFetch as installersSetFetch} from './utils/installers';
const myFetch = typeof window === 'undefined' ? fetch : window.fetch;
DeviceList._setFetch(myFetch);
installersSetFetch(myFetch);

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
