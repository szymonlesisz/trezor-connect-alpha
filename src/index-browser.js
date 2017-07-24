// @flow
'use strict';

/**
 * (C) 2017 SatoshiLabs
 * TODO: description
 * GPLv3
 */

import ViewManager from './view/ViewManager';
import type ConnectChannel from './connect/ConnectChannel';
import ConnectChannelBrowser from './connect/ConnectChannelBrowser';

class TrezorConnect extends ViewManager {

    static getChannel(): ConnectChannel {
        return new ConnectChannelBrowser();
    }

}

module.exports = TrezorConnect;
