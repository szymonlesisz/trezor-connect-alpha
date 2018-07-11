/* @flow */
import type { Device, CoreMessage } from './index';
import * as UI from '../constants/ui';

/*
* Messages from UI
*/

export type ReceivePermission = {
    +type: typeof UI.RECEIVE_PERMISSION,
    payload: {
        granted: boolean;
        remember: boolean;
    }
}

export type ReceiveConfirmation = {
    +type: typeof UI.RECEIVE_CONFIRMATION,
    payload: {
        granted: boolean;
    }
}

export type ReceiveDevice = {
    +type: typeof UI.RECEIVE_DEVICE,
    payload: {
        device: Device;
        remember: boolean;
    }
}

export type ReceivePin = {
    +type: typeof UI.RECEIVE_PIN,
    payload: {
        pin: string
    }
}

export type ReceivePassphrase = {
    +type: typeof UI.RECEIVE_PASSPHRASE,
    payload: {
        save: boolean;
        value: string
    }
}

export type ReceiveAccount = {
    +type: typeof UI.RECEIVE_ACCOUNT,
    payload: {
        account: number;
    }
}

export type ReceiveFee = {
    +type: typeof UI.RECEIVE_FEE,
    payload: {
        +type: 'compose-custom';
        value: number;
    } | {
        +type: 'change-account';
    } | {
        +type: 'send';
        value: string;
    }
}

/*
* Callback message for CustomMessage method
*/

export type CustomMessageRequest = {
    +type: typeof UI.CUSTOM_MESSAGE_REQUEST,
    payload: {
        type: string;
        message: Object;
    }
}

export type UiResponse =
    ReceivePermission
    | ReceiveConfirmation
    | ReceiveDevice
    | ReceivePin
    | ReceivePassphrase
    | ReceiveAccount
    | ReceiveFee
    | CustomMessageRequest;

declare function MessageFactory(type: $PropertyType<ReceivePermission, 'type'>, payload: $PropertyType<ReceivePermission, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<ReceiveConfirmation, 'type'>, payload: $PropertyType<ReceiveConfirmation, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<ReceiveDevice, 'type'>, payload: $PropertyType<ReceiveDevice, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<ReceivePin, 'type'>, payload: $PropertyType<ReceivePin, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<ReceivePassphrase, 'type'>, payload: $PropertyType<ReceivePassphrase, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<ReceiveAccount, 'type'>, payload: $PropertyType<ReceiveAccount, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<ReceiveFee, 'type'>, payload: $PropertyType<ReceiveFee, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<CustomMessageRequest, 'type'>, payload: $PropertyType<CustomMessageRequest, 'payload'>): CoreMessage;

export type UiResponseFactory = typeof MessageFactory;
