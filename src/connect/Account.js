import {
    BitcoreBlockchain,
    WorkerChannel,
    WorkerDiscovery,
} from 'hd-wallet';

import { getPathFromIndex } from '../utils/addressUtils';
import SocketWorker from 'worker-loader!../../node_modules/hd-wallet/lib/socketio-worker/inside';
import DiscoveryWorker from 'worker-loader!../../node_modules/hd-wallet/lib/discovery/worker/inside';
import TrezorCryptoWorker from 'worker-loader!../vendor/trezor-crypto-dist';

function createBlockchain(): BitcoreBlockchain {
    const BITCORE_URLS = ['https://bitcore3.trezor.io', 'https://bitcore1.trezor.io'];
    return new BitcoreBlockchain(BITCORE_URLS, () => createSocketWorker());
    //return new BitcoreBlockchain(BITCORE_URLS, () => { new SocketWorker() });
}

function createDiscoveryWorker() {
    let worker = new SocketWorker();
    return worker;
}

function createSocketWorker() {
    let worker = new DiscoveryWorker();
    return worker;
}

function createCryptoChannel() {
    // const CRYPTO_WORKER_PATH = '../vendor/trezor-crypto-dist.js';
    // let worker = new Worker(CRYPTO_WORKER_PATH);
    // let channel = new hd.WorkerChannel(worker);
    // return channel;
}

export default class Account {
    node: any;
    blockchain: BitcoreBlockchain;
    discovery: WorkerDiscovery;
    unspents: Array<any>;

    constructor(id, node) {
        this.node = node;
        this.unspents = [];
        this.worker = new Worker('../../lib/trezor-crypto.js');
        this.channel = new WorkerChannel(this.worker);
        this.blockchain = createBlockchain();
        this.discovery = new WorkerDiscovery(
            () => createDiscoveryWorker(),
            this.channel,
            this.blockchain
        );
    }

    discover() {
        console.log("HD")
        //hd.lookupBlockRange(this.blockchain, null);
    }

    getIndex() {
        return getPathForIndex(this.node.index);
    }

    getBalance() {
        return this.unspents
            .reduce((b, u) => b + u.value, 0);
    }
}
