// @flow
'use strict';

/**
 * (C) 2017 SatoshiLabs
 * TODO: description
 * GPLv3
 */

import ConnectManager from './connect/ConnectManager';

class TrezorConnect {

    static async requestLogin(args: Object): Promise<Object> {

        let { container, icon, challengeHidden, challengeVisual, callback, requiredFirmware } = args;

        return await ConnectManager.send({
            type: 'login',
            container: container,
            icon: icon,
            challenge_hidden: challengeHidden,
            challenge_visual: challengeVisual
        });
    }


    static async getAccountInfo(args: Object): Promise<Object> {
        let { container, description } = args;

        //let description = parseAccountInfoInput(input);

        return await ConnectManager.send({
            type: 'accountinfo',
            container: container,
            description: description
        });
    }


}

// parses first argument from getAccountInfo
// function parseAccountInfoInput(input) {
//     if (input == null) {
//         return null;
//     }

//     if (typeof input === 'string') {
//         if (input.substr(0, 4) === 'xpub') {
//             return input;
//         }
//         if (isNaN(input)) {
//             var parsedPath = parseHDPath(input);
//             return getIdFromPath(parsedPath);
//         } else {
//             return parseInt(input);
//         }
//     } else if (Array.isArray(input)) {
//         return getIdFromPath(input);
//     } else if (typeof input === 'number') {
//         return input;
//     }
//     throw new Error('Unknown input format.');
// }

module.exports = TrezorConnect;
