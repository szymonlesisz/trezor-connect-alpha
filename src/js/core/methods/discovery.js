/* @flow */
'use strict';

import Account from '../../account/Account';
import Device from '../../device/Device';
import { resolveAfter } from '../../utils/promiseUtils';

import * as UI from '../../constants/ui';
import { UiMessage } from '../CoreMessage';
import type { MethodParams, MethodCallbacks } from './parameters';

import { discover } from '../../account/discovery';
import { getCoinInfoByCurrency } from '../../backend/CoinInfo';
import type { CoinInfo, AccountType } from '../../backend/CoinInfo';
import DataManager from '../../data/DataManager';

const method = async (params: MethodParams, callbacks: MethodCallbacks): Promise<any> => {

    const input: Object = params.input;

    // handle error from async discovery function
    const onError = (error: Error): void => {
        callbacks.getUiPromise().reject(error);
    }

    // start discovering
    const resp: ?Array<Account> = await discover({
        device: callbacks.device,
        coinInfo: input.coinInfo,
        discoverLegacyAccounts: input.discoverLegacyAccounts,
        legacyAddressOnSegwit: input.legacyAddressOnSegwit,
        discoveryLimit: input.discoveryLimit,
        onStart: input.onStart,
        onUpdate: input.onUpdate,
        onComplete: input.onComplete,
        onError
    });

    if (Array.isArray(resp)){
        return resp;
    } else {
        // TODO
        return {
            status: false
        }
    }

}

const params = (raw: Object): MethodParams => {

    const permissions: Array<string> = [];
    const requiredFirmware: string = '1.5.0';

    // validate coin
    let coinInfo: ?CoinInfo = getCoinInfoByCurrency(DataManager.getCoins(), typeof raw.coin === 'string' ? raw.coin : 'Bitcoin');
    if (!coinInfo) {
        throw new Error(`Coin ${raw.coin} not found`);
    }

    let savedAccounts: Array<any>;
    let coin: string;
    let onStart: (newAccount: Account, allAccounts: Array<Account>) => void;
    let onUpdate: (newAccount: Account, allAccounts: Array<Account>) => void;
    let onComplete: (allAccounts: Array<Account>) => void;

    if (raw.onStart && typeof raw.onStart === 'function') {
        onStart = raw.onStart;
    } else {
        onStart = (newAccount: Account, allAccounts: Array<Account>) => { /* empty - */ }
    }

    if (raw.onUpdate && typeof raw.onUpdate === 'function') {
        onUpdate = raw.onUpdate;
    } else {
        onUpdate = (newAccount: Account, allAccounts: Array<Account>) => { /* empty - */ }
    }

    if (raw.onComplete && typeof raw.onComplete === 'function') {
        onComplete = raw.onComplete;
    } else {
        onComplete = (allAccounts: Array<Account>) => { /* empty - */ }
    }

    if (raw.savedState) {

    }

    if (typeof raw.customCoinInfo === 'object') {
        if (typeof raw.customCoinInfo.bip44 === 'number') {
            coinInfo.bip44 = raw.customCoinInfo.bip44;
        }
        if (typeof raw.customCoinInfo.segwit === 'boolean') {
            coinInfo.segwit = raw.customCoinInfo.segwit;
        }
    }

    if (raw.accounts) {
        savedAccounts = raw.accounts;
    }

    return {
        responseID: raw.id,
        deviceID: raw.selectedDevice,
        name: 'discovery',
        useUi: false,
        useDevice: true,
        requiredFirmware,
        requiredPermissions: permissions,
        confirmation: false,
        method,
        input: {
            onStart: onStart,
            onUpdate: onUpdate,
            onComplete: onComplete,
            savedAccounts: savedAccounts,
            coinInfo: coinInfo,
            discoverLegacyAccounts: raw.discoverLegacyAccounts,
            legacyAddressOnSegwit: raw.legacyAddressOnSegwit,
            discoveryLimit: raw.discoveryLimit,
        }
    }

}

export default {
    method,
    confirmation: false,
    params
}
