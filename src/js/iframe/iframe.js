/* @flow */
'use strict';

import { LOG } from '../constants/popup';
import * as IFRAME from '../constants/iframe';

import { Channel, CHANNEL_EVENT, init as initChannel } from '../channel/Channel';
import { parseMessage, UiMessage, ErrorMessage } from '../channel/ChannelMessage';
import type { ChannelMessage } from '../channel/ChannelMessage';

import Log, { init as initLog } from '../utils/debug';


let _channel: Channel;

// custom log
const logger: Log = initLog('IFrame');
const loggerPopup: Log = initLog('Popup');

// Wrapper which listen events from Channel

// since iframe.html needs to send message via window.postMessage
// we need to listen events from Channel and convert it to simple objects possible to send over window.postMessage

const handleMessage = (event: MessageEvent): void => {
    // ignore message from myself
    if (event.source === window) return;

    // ignore messages from domain other then parent.window or popup.window
    if (event.origin !== window.top.location.origin && event.origin !== window.location.origin) return;

    const message: ChannelMessage = parseMessage(event.data);

    // prevent from passing event up
    event.preventDefault();
    event.stopImmediatePropagation();

    switch(message.type) {
        // utility: print log from popup window
        case LOG :
            if (typeof message.args === 'string') {
                let args = JSON.parse(message.args)
                //console[message.level].apply(this, args);
                //logger.debug.apply(this, args);
                loggerPopup.debug(...args);
            }
        break;
    }

    // pass data to Channel
    _channel.handleMessage(message);
};


// communication with parent window
const postMessage = (message: ChannelMessage): void => {
    if (!window.top) {
        logger.error('Cannot reach window.top')
        return;
    }
    logger.debug("postMessage", message);
    window.top.postMessage(message, '*');
}

// init iframe.html
window.addEventListener('load', async (): Promise<void> => {
    try {
        window.addEventListener('message', handleMessage, false);

        _channel = await initChannel();
        _channel.on(CHANNEL_EVENT, postMessage);

        postMessage(new UiMessage(IFRAME.HANDSHAKE));
    } catch(error) {
        // TODO: kill app
        postMessage(new ErrorMessage(IFRAME.ERROR));
    }
}, false);
