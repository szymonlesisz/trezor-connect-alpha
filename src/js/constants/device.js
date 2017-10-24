/* @flow */
'use strict';

// device list events
export const ERROR: string = 'device-error';
export const CONNECT: string = 'device-connect';
export const CONNECT_UNACQUIRED: string = 'device-connectUnacquired';
export const DISCONNECT: string = 'device-disconnect';
export const DISCONNECT_UNACQUIRED: string = 'device-disconnectUnacquired';

export const ACQUIRE: string = 'device-acquire';
export const RELEASE: string = 'device-release';
export const ACQUIRED: string = 'device-acquired';
export const RELEASED: string = 'device-released';
export const USED_ELSEWHERE: string = 'device-used_elsewhere';
export const CHANGED: string = 'device-changed';
export const UPDATE: string = 'device-update';
export const STREAM: string = 'device-stream';
export const LOADING: string = 'device-loading';

// trezor-link events
export const BUTTON: string = 'button';
export const PIN: string = 'pin';
export const PASSPHRASE: string = 'passphrase';
export const WORD: string = 'word';

// custom
export const AUTHENTICATED: string = 'device-authenticated';
