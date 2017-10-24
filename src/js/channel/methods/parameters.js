/* @flow */
'use strict';

import Device from '../../device/Device';
import type { ChannelMessage } from '../ChannelMessage';
import type { Deferred } from '../../utils/deferred';

import { find as findMethod } from './index';

export type ConfirmationMethod = (params: MethodParams, callbacks: MethodCallbacks) => Promise<boolean>;
export type Method = (params: MethodParams, callbacks: MethodCallbacks) => Promise<Object>;

export type MethodCollection = {
    method: Method;
    params: (rawParams: Object) => MethodParams;
    confirmation: ConfirmationMethod | any;
}

export interface MethodParams {
    responseID: number; // call id
    deviceID?: string; // device id

    name: string; // method name
    useUi: boolean; //
    useDevice: boolean; // use device
    requiredFirmware: string;
    // method for requesting permissions from user [optional]
    requiredPermissions: Array<string>;
    //permission: ConfirmationMethod | any;
    // method for requesting confirmation from user [optional]
    confirmation: ConfirmationMethod | any;
    // main method called inside Device.run
    method: Method;
    // parsed input parameters
    input: Object;
}

export interface MethodCallbacks {
    device: Device;
    postMessage: (message: ChannelMessage) => void;
    getPopupPromise: () => Deferred<void>;
    getUiPromise: () => Deferred<string>;
}



export const parse = (message: ChannelMessage): MethodParams => {

    if (!message.data) {
        throw new Error('Data not found');
    }

    const data: Object = { id: message.id, ...message.data };
    //
    if (!data.method || typeof data.method !== 'string') {
        throw new Error('Method not set');
    }

    // TODO: escape incomming string
    // find method collection in list
    const method: ?MethodCollection = findMethod(data.method.toLowerCase());
    if (!method) {
        throw new Error(`Method ${data.method} not found`);
    }

    // find method params
    let params: MethodParams;
    try {
        params = method.params(data);
    } catch(error) {
        throw error;
    }

    return params;
}


