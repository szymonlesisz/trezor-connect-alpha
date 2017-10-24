/* @flow */
'use strict';

export type ConnectSettings = {
    //debug: boolean | {[k: string]: boolean};
    debug: boolean;
    iframeSrc: string;
    popupSrc?: string;
}


export const parse = (settings: any, currentSettings: ?ConnectSettings): ConnectSettings => {

    let debug: boolean = true;
    if (settings && typeof settings.debug === 'boolean') {
        debug = settings.debug;
    }

    return {
        debug: debug,
        iframeSrc: 'a'
    }
}
