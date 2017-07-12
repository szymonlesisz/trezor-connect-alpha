// @flow
'use strict';

/**
 * (C) 2017 SatoshiLabs
 * TODO: description
 * GPLv3
 */

import ConnectChannelNode from './connect/ConnectChannelNode';
import { SHOW_ALERT, REQUEST_PIN } from './ConnectChannel';

const DEBUG: Boolean = false;

class TrezorConnect {

    static async requestLogin(args: Object): Promise<any> {

        var channel = new ConnectChannelNode();
        channel.on(SHOW_ALERT, TrezorConnect.showAlert);
        channel.on(REQUEST_PIN, TrezorConnect.requestPin);
        return await channel.requestLogin().then(response => {
            console.log("REEE!", response);
            return response;
        })
    }

    static showAlert(type){
        console.log("SHOW ALERT", type)
    }

    static requestPin(callback){
        console.log('Please enter PIN. The positions:');
        console.log('7 8 9');
        console.log('4 5 6');
        console.log('1 2 3');
    }
}

module.exports = TrezorConnect;
