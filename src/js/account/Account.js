/* @flow */
'use strict';

import {
    buildTx
} from 'hd-wallet';

import type {
    AccountInfo,
    Stream,
    BuildTxOutputRequest,
    BuildTxRequest,
    BuildTxResult
} from 'hd-wallet';

import * as bitcoin from 'bitcoinjs-lib-zcash';

//import { HD_HARDENED } from '../utils/constants';
//import { sortBy, range, at, reverseBuffer } from '../utils/utils';
import { getPathFromIndex } from '../utils/pathUtils';

import Device from '../device/Device';
import BitcoreBackend from '../backend/BitcoreBackend';
import type { CoinInfo } from '../backend/CoinInfo';

export default class Account {

    // static fromPath(device, backend, path): Account {
    //     const purpose = path[0] & ~HD_HARDENED;
    //     const id = path[2] & ~HD_HARDENED;
    //     const coinInfo = backend.coinInfo;
    //     coinInfo.segwit = (purpose === 49);
    //     return device.session.getHDNode(path, coinInfo.network).then(
    //         node => new Account(id, path, node.toBase58(), backend)
    //     );
    // }

    // static async fromIndex(device: Device, backend: BitcoreBackend, index: number): Promise<Account> {
    //     const coinInfo: CoinInfo = backend.coinInfo;
    //     const path: Array<number> = getPathFromIndex(coinInfo.segwit ? 49 : 44, coinInfo.bip44, index);
    //     const node: bitcoin.HDNode = await device.getCommands().getHDNode(path, coinInfo.network);
    //     return new Account(index, path, node.toBase58(), backend);
    // }

    // Account variables

    id: number;
    basePath: Array<number>;
    xpub: string;
    backend: BitcoreBackend;
    coinInfo: CoinInfo;
    info: AccountInfo;
    segwit: boolean;

    constructor(
        id: number,
        path: Array<number>,
        xpub: string,
        backend: Object,
        coinInfo: CoinInfo
    ) {
        this.id = id;
        this.basePath = path;
        this.xpub = xpub;
        this.backend = backend;
        this.coinInfo = { ...coinInfo }; // local copy
        this.segwit = this.coinInfo.segwit;

        // todo: handle backend errors/disconnect
    }

    setCoinInfo(coinInfo: CoinInfo): void {
        this.coinInfo = coinInfo;
    }

    setAccountMonitorListener(listener: (account: Account) => void ): void {
        var monitor = this.backend.monitorAccountActivity(this.xpub, this.info, true);
        // TODO: handle monitor error
        monitor.values.attach(accountInfo => {
            this.info = accountInfo;
            listener(this);
        });
    }

    monitorActivity(): Stream<AccountInfo | Error> {
        return this.backend.monitorAccountActivity(this.xpub, this.info, true);
    }

    async discover(): Promise<Account> {

        // TODO: catch error
        const info: AccountInfo = await this.backend.loadAccountInfo(
            this.xpub,
            null, // previous state?
            () => { }, // dont know what is that? progress?
            (disposer) => { }, // todo: what is that?
            this.segwit
        );

        this.info = info;
        return this;

        // return this.backend.loadAccountInfo(
        //         this.xpub,
        //         null,
        //         () => { },
        //         (disposer) => { },
        //         this.segwit
        //     ).then(
        //         (info) => {
        //             this.info = info;
        //             return this;
        //         },
        //         (error) => {
        //             // TODO: throw eerrror
        //             console.error('[account] Account loading error', error);
        //         }
        //     );
    }

    getXpub() {
        return this.xpub;
    }

    getPath() {
        return this.basePath;
    }

    getAddressPath(address: string) {
        let addresses = this.info.usedAddresses.concat(this.info.unusedAddresses);
        let index = addresses.indexOf(address);
        // TODO: find in change addresses
        //if (index < 0)
        return this.basePath.concat([0, index]);
    }

    getNextAddress() {
        return this.info.unusedAddresses[0];
    }

    getNextAddressId() {
        return this.info.usedAddresses.length;
    }

    getChangeAddress() {
        return this.info.changeAddresses[this.info.changeIndex];
    }

    isUsed() {
        return (this.info && this.info.transactions.length > 0);
    }

    getBalance() {
        return this.info.balance;
    }

    getConfirmedBalance() {
        return this.info.balance; // TODO: read confirmations
    }

    getAccountInfo(): AccountInfo {
        return this.info;
    }

    getUtxos() {
        return this.info.utxos;
    }

    prevTxRequired(): boolean {
        if (this.segwit || this.backend.coinInfo.forkid !== null) {
            return false;
        }
        return true;
    }
}
