/* @flow */
'use strict';

import Device from '../device/Device';
import { resolveAfter } from '../utils/promiseUtils';
import BitcoreBackend, { create as createBackend } from '../backend/BitcoreBackend';
import Account from './Account';

export const discover = async (
    device: Device,
    onUpdate: (newAccount: Account, allAccounts: Array<Account>) => void,
    onComplete: (allAccounts: Array<Account>) => void,
    onError: (error: Error) => void
): Promise< Array<Account> | void> => {

    const backend: BitcoreBackend = await createBackend(['https://btc-bitcore3.trezor.io'], 'coins.json');

    const accounts: Array<Account> = [];
    const loop = async (index: number): Promise< Array<Account> > => {

        let account: Account = await Account.fromIndex(device, backend, index);
        let discovered: Account = await account.discover();

        accounts.push(discovered);
        onUpdate(discovered, accounts);

        if (discovered.info.transactions.length > 0) {
            return loop(index + 1);
        } else {
            onComplete(accounts);
            return accounts;
        }
    }

    try {
        return await loop(0);
    } catch(error) {
        onError(error);
    }

};
