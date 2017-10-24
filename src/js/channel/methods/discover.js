/* @flow */
'use strict';

import Device from '../../device/Device';
import { getPathFromIndex } from '../../utils/pathUtils';
import { resolveAfter } from '../../utils/promiseUtils';

import * as UI from '../../constants/ui';
import { UiMessage } from '../ChannelMessage';
import type { MethodParams, MethodCallbacks } from './parameters';

const method = async (params: MethodParams, callbacks: MethodCallbacks): Promise<Object> => {
    // let path: Array<number> = getPathFromIndex(params.index);
    // let node = await params.device.getCommands().getPublicKey(path);
    // return { accountIndex: params.index, xpub: node.message.xpub };

    // wait for popup window
    await callbacks.getPopupPromise().promise;
    // request select account view
    callbacks.postMessage(new UiMessage(UI.SELECT_ACCOUNT, []));

    const accounts = [];
    const loop = async (id: number) => {
        let acc = await getAccount(id);
        if (acc) {
            accounts.push(acc);
            // update select account view
            callbacks.postMessage(new UiMessage(UI.SELECT_ACCOUNT, accounts));
            return await loop(id + 1);
        } else {
            return accounts;
        }
    }
    await loop(0);

    // wait for account selection
    const selectedAccountIndex: string = await callbacks.getUiPromise().promise;

    // wait for popup window
    //const selectedAccountIndex2: string = await params.getUiPromise().promise;
    // request select fee view
    //params.postMessage(new UiMessage(UI.SELECT_ACCOUNT, []));

    return accounts[ parseInt(selectedAccountIndex) ];
}

const getAccount = async (id: number): Promise<?Object> => {
    if (id > 10) return null;
    await resolveAfter(100, null);
    return {
        id: id,
        label: `Account # ${id}`,
        path: id
    };
}

export default method;
