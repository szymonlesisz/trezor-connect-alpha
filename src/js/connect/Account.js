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
import {networks} from 'bitcoinjs-lib-zcash';
import type HDNode from 'bitcoin-zcash';


import { getPathFromIndex } from '../utils/pathUtils';

import FastXpubWasm from 'file-loader?name=fastxpub.wasm!hd-wallet/workers/fastxpub.wasm';
import FastXpubWorker from 'worker-loader?name=fastxpub-worker.js!hd-wallet/workers/fastxpub.js';
import DiscoveryWorker from 'worker-loader?name=discovery-worker.js!hd-wallet/workers/discovery-worker.js';
import SocketWorker from 'worker-loader?name=socketio-worker.js!hd-wallet/workers/socket-worker.js';

function createBlockchain(): BitcoreBlockchain {
    const BITCORE_URLS = ['https://bitcore3.trezor.io', 'https://bitcore1.trezor.io'];
    return new BitcoreBlockchain(BITCORE_URLS, () => createSocketWorker());
}

function createSocketWorker() {
    let worker = new SocketWorker();
    return worker;
}

function createDiscoveryWorker() {
    let worker = new DiscoveryWorker();
    return worker;
}

function createFastXpubWorker() {
    let worker = new FastXpubWorker();
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

        // fetch(fastxpubWasm).then(response => {
        //     response.arrayBuffer().then(buffer => {
        //         console.log("ABC", buffer);
        //     })
        // })
        this.node = node;
        this.unspents = [];
        //this.worker = new FastXPubWorker();
        //this.channel = new WorkerChannel(this.worker);
        //this.blockchain = createBlockchain();
        // this.discovery = new WorkerDiscovery(
        //     this.worker,
        //     this.channel,
        //     this.blockchain
        // );

        const BITCORE_URLS = ['https://bitcore1.trezor.io', 'https://bitcore3.trezor.io'];
        const XPUBS = [
            'xpub6CVyffQCbaVLjV95CVVStaFJCNR18xpJBdJVTBGdPrm3ybstuY5271BuABZffLJ5y8i4TwLMXsBL3zJFcTonsLbGECpoWftm8Cig6GEkHg4',
            'xpub6BiVtCpG9fQQ8pVjVF7jm3kLahkNbQRkWGUvzsKQpXWYvhYD4d4UDADxZUL4xp9UwsDT5YgwNKofTWRtwJgnHkbNxuzLDho4mxfS9KLesGP',
            'xpub6BiVtCpG9fQQCgxA541qm9qZ9VrGLScde4zsAMj2d15ewiMysCAnbgvSDSZXhFUdsyA2BfzzMrMFJbC4VSkXbzrXLZRitAmUVURmivxxqMJ',
            'xpub6BiVtCpG9fQQDvwDNekCEzAr3gYcoGXEF27bMwSBsCVP3bJYdUZ6m3jhv9vSG7hVxff3VEfnfK4fcMr2YRwfTfHcJwM4ioS6Eiwnrm1wcuf',
            'xpub6BiVtCpG9fQQGq7bXBjjf5zyguEXHrmxDu4t7pdTFUtDWD5epi4ecKmWBTMHvPQtRmQnby8gET7ArTzxjL4SNYdD2RYSdjk7fwYeEDMzkce',
        ];

        const fastXpubWasmFilePromise = fetch(FastXpubWasm).then(response => response.ok ? response.arrayBuffer() : Promise.reject('failed to load'));
        const blockchain = new BitcoreBlockchain(BITCORE_URLS, createSocketWorker);
        const discovery = new WorkerDiscovery(createDiscoveryWorker, createFastXpubWorker(), fastXpubWasmFilePromise, blockchain);
        const network = networks.bitcoin;

        return this.discover(XPUBS, discovery, network);
    }

    async discover() {
        //return await
    }

    discover2(xpubs, discovery, network) {

        const appState = [];
        const processes = [];

        let done = 0;
        xpubs.forEach((xpub, i) => {
            const process = discovery.discoverAccount(null, xpub, network);
            appState[i] = {xpub, info: 0};

            process.stream.values.attach(status => {
                appState[i] = {xpub, info: status.transactions};

                this.refresh();
            });
            process.ending.then(info => {
                appState[i] = {xpub, info};
                this.refresh();
                done++;
                if (done === xpubs.length) {
                    console.timeEnd('portfolio');
                }
                console.log("AppState", appState);
            });
            processes.push(process);
            this.refresh();
        });
        console.time('portfolio');
    }

    refresh() {

    }

    getIndex() {
        return getPathForIndex(this.node.index);
    }

    getBalance() {
        return this.unspents
            .reduce((b, u) => b + u.value, 0);
    }
}
