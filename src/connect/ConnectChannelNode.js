// @flow

import ConnectChannel from './ConnectChannel';
import DeviceList from '../device/DeviceList';
import trezorLink from 'trezor-link-node';
import { setFetch as installersSetFetch } from '../utils/installers';

const { Bridge, Fallback, Lowlevel, NodeHid } = trezorLink;
let fetch;

if(typeof window === 'undefined'){
    fetch = require('node-fetch');
}else{
    fetch = window.fetch;
}

DeviceList._setTransport(() => new Fallback([new Bridge(), new Lowlevel(new NodeHid())]));
DeviceList._setFetch(fetch);
installersSetFetch(fetch);

export default class ConnectChannelNode extends ConnectChannel {
    constructor(){
        super();
    }
}
