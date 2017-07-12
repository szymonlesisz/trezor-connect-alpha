// @flow

import ConnectChannel from './ConnectChannel';
import DeviceList from '../device/DeviceList';
import trezorLink from 'trezor-link';
import { setFetch as installersSetFetch } from '../utils/installers';

const { Bridge, Extension, Lowlevel, WebUsb, Fallback } = trezorLink;
let sharedWorkerFactory: () => SharedWorker = () => { throw new Error('Shared worker not set.'); };
DeviceList._setTransport(() =>
    new Fallback(
        [
            new Extension(),
            new Bridge(),
            new Lowlevel(
                new WebUsb(),
                () =>
                    sharedWorkerFactory()
            )
        ]
    )
);

DeviceList._setFetch(window.fetch);
installersSetFetch(window.fetch);

export default class ConnectChannelBrowser extends ConnectChannel {
    constructor(){
        super();
    }
}
