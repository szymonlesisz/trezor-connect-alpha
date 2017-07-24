// import {
//     BitcoreBlockchain,
//     WorkerChannel,
//     WorkerDiscovery,
// } from 'hd-wallet';

// import {
//     BitcoreBlockchain,
//     WorkerChannel,
//     WorkerDiscovery,
// } from 'hd-wallet/lib/hdwallet';


import {
    BitcoreBlockchain,
    WorkerChannel,
    WorkerDiscovery,
} from 'hd-wallet';

import { getPathFromIndex } from '../utils/pathUtils';

console.log("PROCESS", process.env.NODE_ENV)

const SOCKETIO_WORKER_PATH: string = 'socketio-worker.js';
const DISCOVERY_WORKER_PATH: string = 'discovery-worker.js';
const XPUBGENERATOR_WORKER_PATH: string = 'xpubgenerator-worker.js';


// from balified src
import SocketWorker from 'worker-loader?name=socketio-worker.js!../../node_modules/hd-wallet/lib/socketio-worker/inside';
import DiscoveryWorker from 'worker-loader?name=discovery-worker.js!../../node_modules/hd-wallet/lib/discovery/worker/inside/index';





// from balified src
//import SocketWorker from 'worker-loader!../../node_modules/hd-wallet/lib/socketio-worker/inside';
//import SocketWorker from 'worker-loader?inline&fallback=false!../../node_modules/hd-wallet/lib/socketio-worker/inside';
//import DiscoveryWorker from 'worker-loader?inline&fallback=false!../../node_modules/hd-wallet/lib/discovery/worker/inside/index';

//console.log("SOKET!", SocketWorker)


// from bundle
// import SocketWorker from 'worker-loader?inline&fallback=false!../../node_modules/hd-wallet/lib/socket-worker';
// import DiscoveryWorker from 'worker-loader?inline&fallback=false!../../node_modules/hd-wallet/lib/discovery-worker';

// from source
//import SocketWorker from 'worker-loader?inline&fallback=false!../../node_modules/hd-wallet/lib/socketio-worker/inside';
//import DiscoveryWorker from 'worker-loader?inline&fallback=false!../../node_modules/hd-wallet/lib/discovery/worker/inside';
//import TrezorCryptoWorker from 'worker-loader?inline&fallback=false!../../node_modules/hd-wallet/lib/trezor-crypto/emscripten/trezor-crypto';
//const TrezorCryptoWorker = () => {};

// import SocketWorker from 'worker-loader?name=SocketWorker.js!../../node_modules/hd-wallet/lib/socketio-worker/inside';
// import DiscoveryWorker from 'worker-loader?name=DiscoveryWorker.js!../../node_modules/hd-wallet/lib/discovery/worker/inside';
// import TrezorCryptoWorker from 'worker-loader?name=CryptoWorker.js!../../node_modules/hd-wallet/lib/trezor-crypto/emscripten/trezor-crypto';


// import SocketWorker from 'worker-loader?inline&fallback=false!../../node_modules/hd-wallet2/dist/socket-worker.js';
// import DiscoveryWorker from 'worker-loader?inline&fallback=false!../../node_modules/hd-wallet2/dist/discovery-worker.js';
// import TrezorCryptoWorker from 'worker-loader?inline&fallback=false!../../node_modules/hd-wallet2/dist/trezor-crypto.js';

function createBlockchain(): BitcoreBlockchain {
    const BITCORE_URLS = ['https://bitcore3.trezor.io', 'https://bitcore1.trezor.io'];
    return new BitcoreBlockchain(BITCORE_URLS, () => createSocketWorker());
}

function createSocketWorker() {
    //let worker = process.env.NODE_ENV === 'umd-lib' ? new Worker(SOCKETIO_WORKER_PATH) : new SocketWorker();
    let worker = new SocketWorker();
    return worker;
}

function createDiscoveryWorker() {
    let worker = new DiscoveryWorker();
    //let worker = process.env.NODE_ENV === 'umd-lib' ? new Worker(DISCOVERY_WORKER_PATH) : new DiscoveryWorker();
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

        //console.log("DiscoveryWorker", DiscoveryWorker, new DiscoveryWorker() )
        this.node = node;
        this.unspents = [];
        //this.worker = new TrezorCryptoWorker();
        this.worker = createSocketWorker();
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
