/* @flow */
'use strict';

import EventEmitter from 'events';
import { UiMessage, UI_EVENT, DEVICE_EVENT, RESPONSE_EVENT } from '../channel/ChannelMessage';
import type { ChannelMessage } from '../channel/ChannelMessage';
import { CLOSED, OPEN_TIMEOUT } from '../constants/popup';
import { showPopupRequest } from '../popup/showPopupRequest';

export default class ModalManager extends EventEmitter {

    requestTimeout: number = 0;
    openTimeout: number;
    closeInterval: number = 0;

    open(): void {


    }

    constructor() {
        super();
        // bind methods
    }

    request(): void {

    }

    cancel(): void {
        this.close();
    }

    setAddress(url: string): void {

    }



    close(): void {

    }

    postMessage(message: ChannelMessage, origin: Object): void {


    }
}
