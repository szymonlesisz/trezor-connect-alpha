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

        return await ConnectManager.send({
            type: 'accountinfo',
            container: container,
            description: description
        });
    }


}

module.exports = TrezorConnect;
