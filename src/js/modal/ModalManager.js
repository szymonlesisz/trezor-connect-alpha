/* @flow */
'use strict';

import EventEmitter from 'events';

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

    postMessage(message: any, origin: Object): void {


    }
}
