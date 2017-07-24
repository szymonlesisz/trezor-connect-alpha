// @flow
'use strict';

/**
 * (C) 2017 SatoshiLabs
 * 
 * GPLv3
 */

import PopupManager from './connect/popupManager';

async function requestLogin(...args: Array<T>): Promise<T> {

    
    // backward compatiblity for version <= 1.0
    // requestLogin(hosticon, challenge_hidden, challenge_visual, callback, requiredFirmware)
    let backwardArgs = null;
    // if (typeof args[0] === 'string') {
    //     backwardArgs = { 
    //         icon: args[0],
    //         challengeHidden: args[1],
    //         challengeVisual: args[2],
    //         callback: args[3],
    //         requiredFirmware: args[4] 
    //     };
    // }

    // destructuring arguments
    let { container, icon, challengeHidden, challengeVisual, callback, requiredFirmware } = backwardArgs || args[0];

    return await PopupManager.send({
        container: container,
        type: 'login',
        icon: icon,
        challenge_hidden: challengeHidden,
        challenge_visual: challengeVisual
    });
}


class TrezorConnect {
    static requestLogin = (...args) => requestLogin(...args);

    foo(){
        console.log("bar")
    }
}

module.exports = TrezorConnect;

// if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
//     window.TrezorConnect = TrezorConnect;
// } else {
//     //module.exports = TrezorConnect;
// }