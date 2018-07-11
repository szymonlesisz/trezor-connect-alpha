/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validatePath, fromHardened } from '../../utils/pathUtils';
import type { MessageResponse } from '../../device/DeviceCommands';

import * as UI from '../../constants/ui';
import { UiMessage } from '../../message/builder';

import type { UiPromiseResponse } from 'flowtype';
import type { StellarAddress } from '../../types/trezor';
import type { CoreMessage } from '../../types';

type Params = {
    path: Array<number>;
    showOnTrezor: boolean;
}

export default class StellarGetAddress extends AbstractMethod {

    params: Params;
    confirmed: boolean = false;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read'];
        this.info = 'Export Stellar public key';

        const payload: any = message.payload;

        let path: Array<number>;
        if (payload.hasOwnProperty('path')) {
            path = validatePath(payload.path);
        } else {
            throw new Error('Parameters "path" are missing');
        }

        let showOnTrezor: boolean = true;
        if (payload.hasOwnProperty('showOnTrezor')){
            if (typeof payload.showOnTrezor !== 'boolean') {
                throw new Error('Parameter "showOnTrezor" has invalid type. Boolean expected.');
            } else {
                showOnTrezor = payload.showOnTrezor;
            }
        }

        this.params = {
            path,
            showOnTrezor
        }
    }

    async confirmation(): Promise<boolean> {
        if (this.confirmed) return true;
        // wait for popup window
        await this.getPopupPromise().promise;
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);

        // request confirmation view
        this.postMessage(new UiMessage(UI.REQUEST_CONFIRMATION, {
            view: 'export-address',
            label: `Export Stellar address for Account#${ (fromHardened(this.params.path[2]) + 1) }`
        }));

        // wait for user action
        const uiResp: UiPromiseResponse = await uiPromise.promise;
        this.confirmed = uiResp.payload.granted;

        return this.confirmed;
    }

    async run(): Promise<StellarAddress> {
        const response: MessageResponse<StellarAddress> = await this.device.getCommands().stellarGetAddress(this.params.path, this.params.showOnTrezor);
        return response.message;
    }
}
