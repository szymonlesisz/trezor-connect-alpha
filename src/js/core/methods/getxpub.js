/* @flow */
'use strict';

import Account from '../../account/Account';
import Device from '../../device/Device';
import { validatePath, getPathFromIndex, getAccountIndexFromPath } from '../../utils/pathUtils';

import * as UI from '../../constants/ui';
import { UiMessage } from '../CoreMessage';
import type { UiPromiseResponse } from '../CoreMessage';
import type { MethodParams, MethodCallbacks } from './parameters';
import { checkPermissions } from './permissions';

import { discover, stopDiscovering } from '../../account/discovery';


import { getCoinInfoByHash, getCoinInfoByCurrency, getCoinInfoFromPath, getAccountLabelFromPath, getCoinName, generateCoinInfo } from '../../backend/CoinInfo';
import type { CoinInfo, AccountType } from '../../backend/CoinInfo';
import DataManager from '../../data/DataManager';

import type { AccountInfo } from 'hd-wallet';


const method = async (params: MethodParams, callbacks: MethodCallbacks): Promise<Object> => {
    const input: Object = params.input;
    if (input.path) {
        let node = await callbacks.device.getCommands().getPublicKey(input.path, input.coin);
        return {
            accountIndex: input.account,
            xpub: node.message.xpub,
            path: input.path,
            input
        };
    } else {
        // wait for popup window
        await callbacks.getPopupPromise().promise;

        // request account selection view
        callbacks.postMessage(new UiMessage(UI.SELECT_ACCOUNT, {
            coinInfo: input.coinInfo,
            accounts: []
        }));

        let accounts: Array<Account> = [];

        const simpleAccount = (account: Account): Object => {
            return {
                id: account.id,
                label: `Account #${account.id + 1}`,
                segwit: account.segwit,
                balance: account.info ? account.info.balance : -1,
                fresh: account.info ? account.info.transactions.length < 1 : false,
            }
        }

        // handle error from async discovery function
        const onStart = (newAccount: Account, allAccounts: Array<Account>): void => {
            let simpleAcc: Array<Object> = [];
            for (let a of allAccounts) {
                simpleAcc.push( simpleAccount(a) );
            }
            simpleAcc.push( simpleAccount(newAccount) );

            callbacks.postMessage(new UiMessage(UI.SELECT_ACCOUNT, {
                coinInfo: input.coinInfo,
                accounts: simpleAcc
            }));
        }

        const onUpdate = (newAccount: Account, allAccounts: Array<Account>): void => {

            accounts = allAccounts;

            let simpleAcc: Array<Object> = [];
            for (let a of allAccounts) {
                simpleAcc.push( simpleAccount(a) );
            }
            // update account selection view
            //callbacks.postMessage(new UiMessage(UI.SELECT_ACCOUNT, allAccounts));
            callbacks.postMessage(new UiMessage(UI.SELECT_ACCOUNT, {
                coinInfo: input.coinInfo,
                accounts: simpleAcc
            }));
        }

        const onComplete = (allAccounts: Array<Account>): void => {
            let simpleAcc: Array<Object> = [];
            for (let a of allAccounts) {
                simpleAcc.push( simpleAccount(a) );
            }
            // update account selection view
            //callbacks.postMessage(new UiMessage(UI.SELECT_ACCOUNT, allAccounts));
            callbacks.postMessage(new UiMessage(UI.SELECT_ACCOUNT, {
                coinInfo: input.coinInfo,
                accounts: simpleAcc,
                complete: true
            }));
        }

        // handle error from async discovery function
        const onError = (error: Error): void => {
            callbacks.getUiPromise().reject(error);
        }

        // start discovering
        // this method is async but we dont want to stop here and block UI which will happen if we use "await"
        // that's why we use callbacks to update UI or throw error to UiPromise
        discover({
            device: callbacks.device,
            coin: input.coin,
            onStart,
            onUpdate,
            onComplete,
            onError
        });

        // wait for user action or error from discovery
        let uiResp: UiPromiseResponse = await callbacks.getUiPromise().promise;
        const resp: string = uiResp.data;
        const respNumber: number = parseInt(resp);

        // if ui promise reject we need to stop discovering
        stopDiscovering();

        if (!isNaN(respNumber) && accounts[respNumber]) {
            //const coinInfo = callbacks.device
            const selectedAccount: Account = accounts[respNumber];

            // close window
            callbacks.postMessage(new UiMessage(UI.CLOSE_UI_WINDOW));

            return {
                accountIndex: selectedAccount.id,
                xpub: selectedAccount.xpub,
                path: selectedAccount.basePath,
                input
            };
        } else {
            // TODO:
            console.log("AAAAA", accounts, respNumber);
            throw new Error("Selected account not found!")
        }
    }
}

const confirmation = async (params: MethodParams, callbacks: MethodCallbacks): Promise<boolean> => {

    // confirmation not needed when xpub is requested without path
    // we need to do discovery and let the user pick account
    // or parameter "confirmation" is set to false
    if (!params.input.confirm || !params.input.path) {
        return true;
    }
    // wait for popup window
    await callbacks.getPopupPromise().promise;

    // request confirmation view
    callbacks.postMessage(new UiMessage(UI.REQUEST_CONFIRMATION, {
        view: 'export_xpub',
        accountType: params.input.accountType,
    }));
    // wait for user action
    let uiResp: UiPromiseResponse = await callbacks.getUiPromise().promise;
    let resp: string = uiResp.data;
    return (resp === 'true');
}

const params = (raw: Object): MethodParams => {

    //const permissions: Array<string> = checkPermissions(['read', 'write', 'read-meta', 'write-meta']);
    const permissions: Array<string> = checkPermissions(['read', 'read-meta']);
    const requiredFirmware: string = '1.5.0';

    let path: Array<number>;
    let accountType: AccountType;

    let confirm: boolean = true;
    let coin: string;
    let coinLabel: string;
    let coinInfo: ?CoinInfo;

    if (raw.path) {
        // get xpub by path
        path = validatePath(raw.path);
        coinInfo = getCoinInfoFromPath(DataManager.getCoins(), path);
        if (coinInfo) {
            coin = coinInfo.name;
        } else {
            // coin not found in coins.json
            // it could be altcoin or Copay id
            coin = 'Bitcoin';
            coinInfo = generateCoinInfo( getCoinName(path) );
        }
        accountType = getAccountLabelFromPath(coinInfo.label, path, coinInfo.segwit);
    } else {
        // get xpub by account number or from discovery
        coinInfo = getCoinInfoByCurrency(DataManager.getCoins(), typeof raw.coin === 'string' ? raw.coin : 'Bitcoin');
        if (!coinInfo) {
            throw new Error(`Coin ${raw.coin} not found`);
        }
        coin = coinInfo.name;

        if (!isNaN(parseInt(raw.account))) {
            let bip44purpose: number = 44;
            if (coinInfo.segwit) {
                bip44purpose = 49;
                if (typeof raw.accountLegacy === 'boolean' && raw.accountLegacy) {
                    bip44purpose = 44;
                }
            }
            path = getPathFromIndex(bip44purpose, coinInfo.bip44, raw.account);
            accountType = getAccountLabelFromPath(coinInfo.label, path, coinInfo.segwit);
        }
    }

    if (typeof raw.confirmation === 'boolean') {
        confirm = raw.confirmation;
    }

    let useUi: boolean = true;
    if (path && !confirm && permissions.length < 1) {
        useUi = false;
    }

    return {
        responseID: raw.id,
        deviceID: raw.selectedDevice,
        name: 'getxpub',
        useUi: useUi,
        useDevice: true,
        requiredFirmware,
        requiredPermissions: permissions,
        confirmation,
        method,
        input: {
            path: path,
            confirm: confirm,
            coin: coin,
            accountType: accountType,
            coinInfo: coinInfo
        }
    }

}

export default {
    method,
    confirmation,
    params
}