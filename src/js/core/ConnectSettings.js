/* @flow */
'use strict';

export type ConnectSettings = {
    //debug: boolean | {[k: string]: boolean};
    debug: boolean;
    iframe_src: string;
    popup_src: string;
    config_src: string;
    coins_src: string;
    firmware_releases_src: string;
    transport_config_src: string;
    latest_bridge_src: string;
}

/*
 * Initial settings for connect.
 * It could be changed by passing values into TrezorConnect.init(...) method
 */

const initialSettings: ConnectSettings = {
    debug: false,
    iframe_src: 'iframe.html',
    popup_src: 'popup.html',
    config_src: 'config.json',
    coins_src: 'coins.json',
    firmware_releases_src: 'releases.json',
    transport_config_src: 'config_signed.bin',
    latest_bridge_src: 'latest.txt'
}

let currentSettings: ConnectSettings = initialSettings;

export const parse = (input: ?Object): ConnectSettings => {

    if (!input) return currentSettings;

    const settings: ConnectSettings = { ...currentSettings };
    if (typeof input.debug === 'boolean') {
        settings.debug = input.debug;
    } else if(typeof input.debug === 'string') {
        settings.debug = input.debug === 'true';
    }

    if (typeof input.iframe_src === 'string') {
        // TODO: escape string
        settings.iframe_src = input.iframe_src;
    }

    if (typeof input.popup_src === 'string') {
        // TODO: escape string
        settings.popup_src = input.popup_src;
    }

    currentSettings = settings;
    return currentSettings;
}

export type ValidSettings = {
    [ key: string ]: string;
}

export type IFrameDataAttributes = {
    [ key: string ]: string;
}

export const validate = (input: Object): ValidSettings => {
    const parsed: ConnectSettings = parse(input);
    const valid: ValidSettings = {};

    for (let key of Object.keys(input)) {
        if (typeof initialSettings[key] !== 'undefined') {
            valid[key] = input[key];
        }
    }
    return valid;
}

export const setDataAttributes = (iframe: Element, input: Object): IFrameDataAttributes => {
    const settings: ValidSettings = validate(input);
    const attrs: IFrameDataAttributes = {};
    const ignored: Array<string> = ['iframe_src', 'popup_src'];
    for (let key of Object.keys(settings)) {
        if (ignored.indexOf(key) < 0) {
            iframe.setAttribute(`data-${key}`, encodeURI( settings[key].toString() ) );
        }
    }
    return attrs;
}
