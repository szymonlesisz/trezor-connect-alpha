/* @flow */
'use strict';

import Account from '../../account/Account';
import TransactionComposer from '../../tx/TransactionComposer';
import type { FeeLevel } from '../../tx/fees/index';

import Device from '../../device/Device';
import { validatePath, getPathFromIndex, getAccountIndexFromPath } from '../../utils/pathUtils';

import * as UI from '../../constants/ui';
import { UiMessage } from '../CoreMessage';
import type { UiPromiseResponse } from '../CoreMessage';
import type { MethodParams, MethodCallbacks } from './parameters';
import { checkPermissions } from './permissions';

import { discover, stopDiscovering } from '../../account/discovery';

import BitcoreBackend, { create as createBackend } from '../../backend/BitcoreBackend';
import { getCoinInfoByCurrency } from '../../backend/CoinInfo';
import type { CoinInfo, AccountType } from '../../backend/CoinInfo';
import DataManager from '../../data/DataManager';

import { resolveAfter } from '../../utils/promiseUtils';
import { formatAmount } from '../../utils/formatUtils';
import { stringToHex } from '../../utils/bufferUtils';
import * as bitcoin from 'bitcoinjs-lib-zcash';

import {
    buildTx
} from 'hd-wallet';

import {
    Transaction as BitcoinJsTransaction,
} from 'bitcoinjs-lib-zcash';

import type {
    AccountInfo,
    OutputRequest,
    Result as BuildTxResult
} from 'hd-wallet';

import * as trezor from '../../device/trezorTypes';
import type { MessageResponse } from '../../device/DeviceCommands';


// local types
type MethodInput = {
    outputs: Array<any>;
    coinInfo: CoinInfo;
    pushTransaction: boolean;
}

// postMessage object to popup
type SimpleBuildTxResult = {
    name: string;
    minutes: number,
    fee: number;
    bytes?: number,
    feePerByte?: number;
}

const simpleTxResult = (level: FeeLevel, minutes: number, tx: BuildTxResult): SimpleBuildTxResult => {
    let simple: SimpleBuildTxResult = {
        name: level.name,
        minutes: minutes,
        fee: 0
    }
    if (tx.type === 'final') {
        simple.fee = tx.fee,
        simple.bytes = tx.bytes,
        simple.feePerByte = tx.feePerByte
    }
    return simple;
}


// convert Account to simple object to send via postMessage
// TODO: specify type for this simple object
const simpleAccount = (account: Account): Object => {
    return {
        id: account.id,
        label: `Account #${account.id + 1}`,
        segwit: account.segwit,
        discovered: account.info ? true : false,
        balance: account.info ? account.info.balance : -1,
        fresh: account.info ? account.info.transactions.length < 1 : false,
    }
}


const method = async (params: MethodParams, callbacks: MethodCallbacks): Promise<Object> => {

    const input: Object = params.input;
    const coinInfo: CoinInfo = input.coinInfo;

    // wait for popup window
    await callbacks.getPopupPromise().promise;

    // update operation label in popup
    if (input.total > 0) {
        callbacks.postMessage(new UiMessage(UI.SET_OPERATION, `Send ${ formatAmount(input.total, coinInfo) }`));
    }

    // request account selection view
    callbacks.postMessage(new UiMessage(UI.SELECT_ACCOUNT, {
        coinInfo,
        accounts: []
    }));

    // create backend instance
    // TODO: check if backend was initialized before
    const backend: BitcoreBackend = await createBackend(coinInfo.name);
    let accounts: Array<Account> = [];
    let discoveryCompleted: boolean = false;

    // account discovery start callback
    const onStart = (newAccount: Account, allAccounts: Array<Account>): void => {

        let sAccounts: Array<Object> = allAccounts.map(a => simpleAccount(a));
        // add not discovered account to view
        sAccounts.push( simpleAccount(newAccount) );

        // update account selection view
        callbacks.postMessage(new UiMessage(UI.SELECT_ACCOUNT, {
            coinInfo,
            accounts: sAccounts
        }));
    }

    // account discovery update callback
    const onUpdate = (newAccount: Account, allAccounts: Array<Account>): void => {
        // update local state
        accounts = allAccounts;

        let sAccounts: Array<Object> = allAccounts.map(a => simpleAccount(a));
        // update account selection view
        callbacks.postMessage(new UiMessage(UI.SELECT_ACCOUNT, {
            coinInfo,
            accounts: sAccounts
        }));
    }

    // account discovery complete callback
    const onComplete = (allAccounts: Array<Account>): void => {
        // update local state
        discoveryCompleted = true;

        let sAccounts: Array<Object> = allAccounts.map(a => simpleAccount(a));
        // update account selection view
        callbacks.postMessage(new UiMessage(UI.SELECT_ACCOUNT, {
            coinInfo,
            accounts: sAccounts,
            complete: true
        }));


    }

    // handle error from discovery function
    const onError = (error: Error): void => {
        callbacks.getUiPromise().reject(error);
    }

    // start discovering
    // this method is async but we dont want to stop here and block UI which will happen if we use "await"
    // that's why we use callbacks to update UI or throw error to UiPromise
    discover({
        device: callbacks.device,
        backend,
        onStart,
        onUpdate,
        onComplete,
        onError
    });


    // restore discovery (back from fee view or insufficient funds view)
    const restoreDiscovery = (): void => {

        // update operation label in popup
        if (input.total === 0) {
            callbacks.postMessage(new UiMessage(UI.SET_OPERATION, "Payment request"));
        }

        if (discoveryCompleted) {
            onComplete(accounts);
        } else {
            discover({
                device: callbacks.device,
                accounts: accounts,
                onStart,
                onUpdate,
                onComplete,
                onError
            });
        }
    }

    const showInsufficientFundsView = async (): Promise<void> => {
        // show error view
        callbacks.postMessage(new UiMessage(UI.INSUFFICIENT_FUNDS));
        // wait few seconds...
        await resolveAfter(2000, null);
        // go back to discovery
        restoreDiscovery();
    }

    let selectedAccount: Account;
    let currentHeight: number;
    let txComposer: TransactionComposer;

    // handle response from account selection view
    const onAccountSelection = async (id: number): Promise<void> => {
        selectedAccount = accounts[id];

        // setTimeout(() => {
        //     callbacks.device.getCommands().clearSession();
        // }, 1000)


        // insufficient funds
        // TODO: dust limit is bigger than minFee
        // if (selectedAccount.getBalance() < input.total + coinInfo.dustLimit) {
        //     await showInsufficientFundsView();
        //     return;
        // }

        // init tx composer
        console.warn("NEW TX COMPOSER instane")
        txComposer = new TransactionComposer(selectedAccount, input.outputs);
        await txComposer.init();
        const txs: Array<BuildTxResult> = await txComposer.composeAllLevels();

        console.log("TXS", txs, txComposer.feeLevels)

        // check if there is at least one valid transaction
        let valid: boolean = false;
        txs.forEach( (t: BuildTxResult) => {
            if (t.type === 'final') {
                valid = true;
                return;
            // TODO: handle errors from composing
            } else if (t.type === 'error' && t.error === 'TWO-SEND-MAX'){
                throw new Error('Double send max!');
            }
        });

        if (!valid) {
            // TODO: few more tries with custom fee (low fee / 4)?

            // check with minimal custom fee
            let tx: BuildTxResult = txComposer.compose(coinInfo.minFee);
            console.warn("NOT VALID czek", tx, coinInfo.minFee)
            if (tx.type === 'final') {
                // update last tx
                txComposer.composed[ txComposer.composed.length - 1 ] = tx;
            } else {
                await showInsufficientFundsView();
                return;
            }
        }

        // update operation label in popup
        if (input.total === 0) {
            callbacks.postMessage(new UiMessage(UI.SET_OPERATION, `Send ${ formatAmount(txs[ txs.length - 1 ].totalSpent, coinInfo) }`));
        }

        // combine fee levels with builded txs into a simple object
        const list: Array<SimpleBuildTxResult> = [];
        for (let [index, level] of txComposer.feeLevels.entries()) {
            list.push( simpleTxResult(level, txComposer.getEstimatedTime(txs[index].fee), txs[index]) );
        }

        // show fee selection view
        callbacks.postMessage(new UiMessage(UI.SELECT_FEE, {
            list,
            coinInfo,
        }));
    }

    // cycle of interactions with user
    // 1. account selection
    // 2. fee selection
    // 3. (optional) change account button (back to account discovery view)
    // 4. (optional) change custom fee value
    const composingCycle = async (): Promise<BuildTxResult> => {
        // wait for user action
        let uiResp: UiPromiseResponse = await callbacks.getUiPromise().promise;
        // filter incoming UI promise,
        // in corner-case there could be a situation where session will expire
        // and this response will be a pin or passphrase
        if (uiResp.event !== UI.RECEIVE_ACCOUNT && uiResp.event !== UI.RECEIVE_FEE) {
            return await composingCycle();
        }

        const resp: string = uiResp.data;

        if (resp === 'change_account') {
            // back to discovery view
            restoreDiscovery();
            // wait for user action
            return await composingCycle();
        } else if (resp.indexOf('custom') >= 0) {
            // rebuild tx with custom fee
            let tx: BuildTxResult = txComposer.compose(parseInt(resp));
            txComposer.composed[ txComposer.composed.length - 1 ] = tx;
            let simple: SimpleBuildTxResult = simpleTxResult(txComposer.customFeeLevel, txComposer.getEstimatedTime(tx.fee), tx);
            // update fee selection view
            callbacks.postMessage(new UiMessage(UI.UPDATE_CUSTOM_FEE, { ...simple, coinInfo } ));
            // wait for user action
            return await composingCycle();
        } else if (resp.indexOf('fee') >= 0) {
            // return selected fee
            // TODO: double check if composed fee is OK.
            // return result
            return txComposer.composed[ parseInt(resp) ];
        } else {
            // if ui promise reject we need to stop discovering
            stopDiscovering();
            // account selection
            await onAccountSelection( parseInt(resp) );
            // wait for user action
            return await composingCycle();
        }
    }

    const tx: BuildTxResult = await composingCycle();
    // TODO: double check if tx is final


    const refTx: Array<BitcoinJsTransaction> = await txComposer.getReferencedTx(tx.transaction.inputs);
    console.warn("REFTX", refTx, selectedAccount);
    // sign tx with device
    //const signedtx: MessageResponse<trezor.SignedTx> = await callbacks.device.getCommands().signTx(tx, refTx, coinInfo, 1227658);
    const signedtx: MessageResponse<trezor.SignedTx> = await callbacks.device.getCommands().signTx(tx, refTx, coinInfo, input.locktime);

    let txId: string;
    if (input.pushTransaction) {
        try {
            txId = await backend.sendTransactionHex(signedtx.message.serialized.serialized_tx);
        } catch(error) {
            throw {
                custom: true,
                error: error.message,
                ...signedtx.message.serialized
            }
        }
    }

    backend.dispose();

    return {
        txid: txId,
        ...signedtx.message.serialized
    }

}

const confirmation = async (params: MethodParams, callbacks: MethodCallbacks): Promise<boolean> => {
    // empty
    return true;
}

const params = (raw: Object): MethodParams => {

    const permissions: Array<string> = checkPermissions(['write']);
    const requiredFirmware: string = '1.5.0';

    // validate coin
    let coinInfo: ?CoinInfo = getCoinInfoByCurrency(DataManager.getCoins(), typeof raw.coin === 'string' ? raw.coin : 'Bitcoin');
    if (!coinInfo) {
        throw new Error(`Coin ${raw.coin} not found`);
    }

    // validate outputs, parse them into correct type
    let total: number = 0;
    let locktime: number = 0;
    let hasSendMax: boolean = false;
    const parsedOutputs: Array<Object> = [];


    if (raw.locktime && isNaN(parseInt(raw.locktime))) {
        throw new Error('Locktime is not a number');
    } else {
        locktime = parseInt(raw.locktime);
    }

    if (Array.isArray(raw.outputs)) {

        for (let out of raw.outputs) {

            let output: Object = {};

            if (out.type === 'opreturn') {
                if (raw.outputs.length > 1) {
                    throw new Error('Only one output allowed when sending OP_RETURN transaction');
                }

                if (typeof out.data === 'string' && out.data.length > 0) {
                    if (typeof out.dataFormat === 'string' && out.dataFormat === 'text') {
                        out.data = stringToHex(out.data);
                    } else {
                        let re = /^[0-9A-Fa-f]{6}$/g;
                        if (!re.test(out.data)) {
                            throw new Error('OP_RETURN data is not valid hexadecimal');
                        }
                    }

                    if (out.data.length > 80 * 2) {
                        throw new Error('OP_RETURN data size is larger than 80 bytes');
                    }
                }

                output = {
                    type: 'opreturn',
                    dataHex: out.data
                };
            } else if (out.type === 'send-max') {
                if (hasSendMax) {
                    throw new Error('Only one send-max output allowed');
                }
                hasSendMax = true;
                output = {
                    type: 'send-max',
                    address: out.address
                };
            } else {

                if (typeof out.address !== 'string') {
                    throw new Error('Output without address');
                }
                try {
                    const decoded: any = bitcoin.address.fromBase58Check(out.address);
                    if (decoded.version !== coinInfo.network.pubKeyHash && decoded.version !== coinInfo.network.scriptHash) {
                        throw new Error('Invalid address type ' + out.address);
                    }
                } catch (error) {
                    throw new Error('Invalid address ' + out.address);
                }

                if (( typeof out.amount === 'string' && isNaN(parseInt(out.amount)) ) && typeof out.amount !== 'number') {
                    throw new Error('Output without amount');
                }

                output = {
                    type: 'complete',
                    address: out.address,
                    amount: parseInt(out.amount)
                };
                total += out.amount;
            }

            parsedOutputs.push(output);
        }
    } else {
        throw new Error('Outputs is not an Array');
    }

    if (total > 0 && hasSendMax)
        total = 0;

    let pushTransaction: boolean = false;
    if (typeof raw.push === 'boolean') {
        pushTransaction = raw.push;
    }

    return {
        responseID: raw.id,
        deviceID: raw.selectedDevice,
        name: 'composetx',
        useUi: true,
        useDevice: true,
        requiredFirmware,
        requiredPermissions: permissions,
        confirmation: null,
        method,
        input: {
            outputs: parsedOutputs,
            locktime: locktime,
            coinInfo: coinInfo,
            total: total,
            pushTransaction: pushTransaction,
        }
    }

}

export default {
    method,
    confirmation,
    params
}
