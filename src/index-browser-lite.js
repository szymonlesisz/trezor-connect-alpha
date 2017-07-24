// @flow
'use strict';

/**
 * (C) 2017 SatoshiLabs
 * TODO: description
 * GPLv3
 */

import ViewManager from './view/ViewManager';
import type ConnectChannel from './connect/ConnectChannel';
import ConnectChannelBrowserLite from './connect/ConnectChannelBrowserLite';

class TrezorConnect extends ViewManager {

    static getChannel(): ConnectChannel {
        return new ConnectChannelBrowserLite();
    }

    // TODO: override methods which are not available in LITE verison and throw error
    static async getXPubKey(args: Object): Promise<Object> {
        // if description == null throw Error
        return null;
    }
}

module.exports = TrezorConnect;
