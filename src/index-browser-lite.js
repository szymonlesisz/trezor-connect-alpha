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
import { getPathFromDescription } from './utils/pathUtils';

class TrezorConnect extends ViewManager {

    static getChannel(): ConnectChannel {
        return new ConnectChannelBrowserLite();
    }

    // TODO: override methods which are not available in LITE verison and return error
    static async getXPubKey(args: Object): Promise<Object> {
        let path = getPathFromDescription(args.description);
        if (path === undefined || path === null) {
            return {
                success: false,
                message: 'Description is not specified. Account discovery is not supported in LITE version.'
            }
        }
        return await super.getXPubKey(args);
    }
}

module.exports = TrezorConnect;
