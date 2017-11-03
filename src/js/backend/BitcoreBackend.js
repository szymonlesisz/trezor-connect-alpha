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

import BIP44 from 'bip44-constants';

import { getCoinInfoByHash, getCoinInfoByCurrency } from './CoinInfo';
import type { CoinInfo } from './CoinInfo';

import { httpRequest } from '../utils/networkUtils';

import DataManager from '../data/DataManager';


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
    coinInfo?: CoinInfo,
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
        const blockchain: BitcoreBlockchain = new BitcoreBlockchain(this.options.bitcoreURL, () => new SocketWorker());
        this.blockchain = blockchain;

        this.lastError = false;

        // $FlowIssue WebAssembly
        const filePromise = typeof WebAssembly !== 'undefined' ? httpRequest(FastXpubWasm, 'binary') : Promise.reject();

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
    }

    async loadCoinInfo(coinInfo: ?CoinInfo): Promise<void> {
        const socket: any = await this.blockchain.socket.promise; // socket from hd-wallet TODO: type
        const info: any = await socket.send({ method: 'getInfo', params: [] }); // TODO: what type is it?

        if (!coinInfo) {
            const hash: string = await this.blockchain.lookupBlockHash(0);
            coinInfo = getCoinInfoByHash(DataManager.getCoins(), hash, info);
            if (!coinInfo) {
                throw new Error('Failed to load coinInfo ' + hash)
            }
        }
        coinInfo.blocks = info.blocks; // TODO: where is this used?

        // set vars
        this.coinInfo = coinInfo;
        this.blockchain.zcash = coinInfo.zcash;
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

    monitorAccountActivity(
        xpub: string,
        data: AccountInfo,
        segwit: boolean
    ): Stream<AccountInfo | Error> {
        if (this.coinInfo == null) {
            throw new Error('Address version not set.');
        }
        const segwit_s = segwit ? 'p2sh' : 'off';
        const res = this.discovery.monitorAccountActivity(data, xpub, this.coinInfo.network, segwit_s);

        this.blockchain.errors.values.attach(() => {
            res.dispose();
        });
        return res;
    }

    async loadCurrentHeight(): Promise<number> {
        const { height } = await this.blockchain.lookupSyncStatus();
        return height;
    }

    async sendTransaction(txBytes: Buffer): Promise<string> {
        return await this.blockchain.sendTransaction(txBytes.toString('hex'));
    }

    async sendTransactionHex(txHex: string): Promise<string> {
        return await this.blockchain.sendTransaction(txHex);
    }

    dispose() {
        // TODO!
    }
}

let backend: ?BitcoreBackend = null;

export const create = async (urlsOrCurrency: Array<string> | string): Promise<BitcoreBackend> => {
    if (typeof urlsOrCurrency === 'string') {
        return await createFromCurrency(urlsOrCurrency);
    } else if(Array.isArray(urlsOrCurrency)) {
        return await createFromUrl(urlsOrCurrency);
    } else {
        throw new Error('Invalid params ' + urlsOrCurrency);
    }
}

export const createFromCurrency = async (currency: string): Promise<BitcoreBackend> => {
    const coinInfo: ?CoinInfo = getCoinInfoByCurrency(DataManager.getCoins(), currency);
    if (!coinInfo) {
        throw new Error('Currency not found for ' + currency);
    }
    // get bitcore urls from coins.json using currency name/shortcut
    if (coinInfo.bitcore.length < 1) {
        throw new Error('Bitcore urls not found for ' + currency);
    }

    backend = new BitcoreBackend({ bitcoreURL: coinInfo.bitcore, coinInfo: coinInfo });
    await backend.loadCoinInfo(coinInfo);
    return backend;
}

// CoinInfo will be find by network hash
export const createFromUrl = async (urls: Array<string>): Promise<BitcoreBackend> => {
    backend = new BitcoreBackend({ bitcoreURL: urls });
    await backend.loadCoinInfo();
    return backend;
}

export const getBackend = async (): Promise<BitcoreBackend> => {
    if (!backend) {
        backend = await createFromCurrency('btc');
    }
    return backend;
}

export const disposeBackend = (): void => {

}
