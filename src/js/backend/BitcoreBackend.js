/* @flow */
'use strict';

import {
    BitcoreBlockchain,
    WorkerDiscovery,
} from 'hd-wallet';

import type {
    Stream,
    Discovery,
    AccountInfo,
    AccountLoadStatus,
} from 'hd-wallet';

import { loadCoinInfo, getBitcoreUrls, waitForCoinInfo } from './CoinInfo';
import type { CoinInfo } from './CoinInfo';

/* $FlowIssue loader notation */
// import FastXpubWasm from 'file-loader?name=fastxpub.wasm!hd-wallet/lib/fastxpub/fastxpub.wasm';
/* $FlowIssue loader notation */
import FastXpubWasm from 'hd-wallet/lib/fastxpub/fastxpub.wasm';
/* $FlowIssue loader notation */
import FastXpubWorker from 'worker-loader?name=js/fastxpub-worker.js!hd-wallet/lib/fastxpub/fastxpub';
/* $FlowIssue loader notation */
import DiscoveryWorker from 'worker-loader?name=js/discovery-worker.js!hd-wallet/lib/discovery/worker/inside';
/* $FlowIssue loader notation */
import SocketWorker from 'worker-loader?name=js/socketio-worker.js!hd-wallet/lib/socketio-worker/inside';


export type Options = {
    bitcoreURL: Array<string>,
};

export default class BitcoreBackend {

    options: Options;
    blockchain: BitcoreBlockchain;

    lastError: boolean;
    coinInfo: CoinInfo;
    discovery: Discovery;

    constructor(options: Options) {
        this.options = options;

        const worker: FastXpubWorker = new FastXpubWorker();
        //const blockchain: BitcoreBlockchain = new BitcoreBlockchain(this.options.bitcoreURL, new SocketWorker());
        const blockchain: BitcoreBlockchain = new BitcoreBlockchain(["https://btc-bitcore3.trezor.io"], () => new SocketWorker());
        this.blockchain = blockchain;

        this.lastError = false;

        // $FlowIssue WebAssembly
        const filePromise = typeof WebAssembly !== 'undefined'
            ? (fetch(FastXpubWasm, {credentials: 'same-origin'})
                .then(response => response.ok ? response.arrayBuffer() : Promise.reject(new Error('wasm failed to load')))
            ) : Promise.reject();

        this.blockchain.errors.values.attach(() => { this._setError(); });
        this.discovery = new WorkerDiscovery(
            () => new DiscoveryWorker(),
            worker,
            filePromise,
            this.blockchain
        );
    }

    _setError() {
        this.lastError = true;
        //ang.rootScopeApply();
    }

    setCoinInfo(coinInfo: ?CoinInfo) {
        this.coinInfo = coinInfo;
        if (coinInfo != null) {
            this.blockchain.zcash = coinInfo.zcash;
        }
    }

    loadAccountInfo(
        xpub: string,
        data: ?AccountInfo,
        progress: (progress: AccountLoadStatus) => void,
        setDisposer: (disposer: () => void) => void,
        segwit: boolean
    ): Promise<AccountInfo> {
        if (this.coinInfo == null) {
            return Promise.reject(new Error('Address version not set.'));
        }
        const segwit_s = segwit ? 'p2sh' : 'off';

        const discovery = this.discovery.discoverAccount(data, xpub, this.coinInfo.network, segwit_s);

        this.blockchain.errors.values.attach((e) => {
            discovery.dispose(e);
        });

        discovery.stream.values.attach(status => {
            progress(status);
        });

        setDisposer(() => discovery.dispose(new Error('Interrupted by user')));

        return discovery.ending;
    }
}

let coinInfo: ?CoinInfo;

export const create = (urlsOrCurrency: Array<string> | string, coinInfoUrl: string): Promise<BitcoreBackend> => {
    let backend: BitcoreBackend;

    if (typeof urlsOrCurrency === 'string') {
        // get bitcore urls from coins.json using currency name/shortcut
        return loadCoinInfo(coinInfoUrl).then( (coins:Array<CoinInfo>) => {
            const urls: Array<string> = getBitcoreUrls(urlsOrCurrency);
            if (!urls || urls.length < 1) {
                throw new Error('Bitcore urls not found for ' + urlsOrCurrency);
            }
            backend = new BitcoreBackend({ bitcoreURL: urls });
            return waitForCoinInfo(backend.blockchain, coinInfoUrl).then(ci => {
                coinInfo = ci;
                backend.setCoinInfo(ci);
                return backend;
            });
        }).catch(error => {
            throw error;
        });
    } else {
        // get bitcore from bitcoreURLS
        backend = new BitcoreBackend({ bitcoreURL: urlsOrCurrency });
        return waitForCoinInfo(backend.blockchain, coinInfoUrl).then(ci => {
            coinInfo = ci;
            backend.setCoinInfo(ci);
            return backend;
        }).catch(error => {
            throw error;
        });
    }

}
