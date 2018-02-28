/* @flow */
'use strict';

import { validatePath, getPathFromIndex } from '../../utils/pathUtils';
import { checkPermissions } from './permissions';
import type { MethodParams, MethodCallbacks } from './parameters';

const method = async (params: MethodParams, callbacks: MethodCallbacks): Promise<Object> => {
    const input: Object = params.input;
    const node = await callbacks.device.getCommands().cipherKeyValue(input.path, input.key, input.value, input.encrypt, input.ask_on_encrypt, input.ask_on_decrypt);
    return {
        resp: node
    };
};

const confirmation = async (params: MethodParams, callbacks: MethodCallbacks): Promise<boolean> => {
    // empty
    return true;
};

/**
 * Processing incoming message.
 * This method is async that's why it returns Promise but the real response is passed by postMessage(new ResponseMessage)
 * @param {Object} raw
 * @returns {MethodParams}
 */
const params = (raw: Object): MethodParams => {
    const permissions: Array<string> = checkPermissions([]);
    const requiredFirmware: string = '1.5.0';

    return {
        responseID: raw.id,
        name: 'cipherKeyValue',
        useUi: false,
        useDevice: true,
        requiredFirmware,
        requiredPermissions: permissions,
        confirmation: null,
        method,
        input: {
            path: validatePath(raw.path),
            key: raw.key,
            value: raw.value,
            encrypt: raw.encrypt,
            ask_on_encrypt: raw.askOnEncrypt,
            ask_on_decrypt: raw.askOnDecrypt,
        },
    };
};

export default {
    method,
    confirmation,
    params,
};
