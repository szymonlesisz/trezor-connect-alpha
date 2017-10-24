/* @flow */
'use strict';

import Account from '../../account/Account';
import Device from '../../device/Device';
import { validatePath, getPathFromIndex } from '../../utils/pathUtils';

import * as UI from '../../constants/ui';
import { UiMessage } from '../ChannelMessage';
import type { MethodParams, MethodCallbacks } from './parameters';
import { checkPermissions } from './permissions';

import { discover } from '../../account/discovery';

const method = async (params: MethodParams, callbacks: MethodCallbacks): Promise<Object> => {
    const input: Object = params.input;
    if (input.path) {
        let node = await callbacks.device.getCommands().getPublicKey(input.path);
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
        callbacks.postMessage(new UiMessage(UI.SELECT_ACCOUNT, []));

        const onUpdate = (newAccount: Account, allAccounts: Array<Account>): void => {

            let simpleAcc: Array<Object> = [];
            for (let a of allAccounts) {
                simpleAcc.push( a.toSimpleObject() );
            }
            // update account selection view
            //callbacks.postMessage(new UiMessage(UI.SELECT_ACCOUNT, allAccounts));
            callbacks.postMessage(new UiMessage(UI.SELECT_ACCOUNT, simpleAcc));
        }

        const onComplete = (allAccounts: Array<Account>): void => {
            let simpleAcc: Array<Object> = [];
            for (let a of allAccounts) {
                simpleAcc.push( a.toSimpleObject() );
            }
            // update account selection view
            //callbacks.postMessage(new UiMessage(UI.SELECT_ACCOUNT, allAccounts));
            callbacks.postMessage(new UiMessage(UI.SELECT_ACCOUNT, simpleAcc));
        }

        // handle error from async discovery function
        const onError = (error: Error): void => {
            callbacks.getUiPromise().reject(error);
        }

        // start discovering
        // this method is async but we dont want to stop here and block UI which will happen if we use "await"
        // that's why we use callbacks to update UI or throw error to UiPromise
        discover(callbacks.device, onUpdate, onComplete, onError);

        // wait for user action or error from discovery
        let resp: string = await callbacks.getUiPromise().promise;

        if (!isNaN( parseInt(resp) ) ) {
            let path = getPathFromIndex( parseInt(resp) );
            let node = await callbacks.device.getCommands().getPublicKey(path);

            return {
                accountIndex: resp,
                xpub: node.message.xpub,
                path: path,
                input
            };
        } else {
            // TODO:
        }

        // show account selection
        return {
            xpub: 'discovered_from_Account_sel',
            resp: resp
        }
    }
}

const confirmation = async (params: MethodParams, callbacks: MethodCallbacks): Promise<boolean> => {

    // confirmation not needed when xpub is requested without path
    // which means that we need to do discovery and let the user pick account
    // or when parameter "confirmation" is set to false
    if (!params.input.confirm || !params.input.path) {
        return true;
    }
    // wait for popup window
    await callbacks.getPopupPromise().promise;

    // TODO: get coinInfo

    // request confirmation view
    callbacks.postMessage(new UiMessage(UI.REQUEST_CONFIRMATION, {
        view: 'export_xpub',
        label: 'Bitcoin account #1'
    }));
    // wait for user action
    let resp: string = await callbacks.getUiPromise().promise;
    return (resp === 'true');
}

const params = (raw: Object): MethodParams => {

    const permissions: Array<string> = checkPermissions(['read', 'write', 'read-meta', 'write-meta']);
    const requiredFirmware: string = '1.5.0';

    let path: Array<number>;
    let confirm: boolean = true;
    let coin: string;

    if (raw.path) {
        path = validatePath(raw.path);
    } else if (!isNaN(raw.account) ) {
        path = getPathFromIndex(raw.account)
    }

    if (typeof raw.confirmation === 'boolean') {
        confirm = raw.confirmation;
    }

    if (raw.coin && typeof raw.coin === 'string') {
        // TODO validate coin
        coin = raw.coin;
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
            coin: coin
        }
    }

}

export default {
    method,
    confirmation,
    params
}
