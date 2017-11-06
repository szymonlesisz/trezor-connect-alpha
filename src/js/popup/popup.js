/* @flow */
'use strict';

import { popupConsole } from '../utils/debug';
import { parseMessage, UiMessage } from '../core/CoreMessage';
import type { CoreMessage } from '../core/CoreMessage';

import * as POPUP from '../constants/popup';
import * as UI from '../constants/ui';
import { formatAmount } from '../utils/formatUtils';
import { getOrigin } from '../utils/networkUtils';

import { container, showView, postMessage, setOperation } from './view/common';

import * as view from './view';
import styles from  '../../styles/popup.less';


const handleMessage = (event: MessageEvent): void => {

    // ignore messages from domain other then parent.window
    // if (event.origin !== window.opener.location.origin) return;
    if (getOrigin(event.origin) !== getOrigin(document.referrer)) return;

    console.log("handleMessage", event.data);

    let message: CoreMessage = parseMessage(event.data);

    // TODO parse incoming strings to avoid string injections !!!

    switch(message.type) {
        case UI.LOADING :
            //showView('loader');
            initLoaderView(message.data);
        break;
        case UI.SET_OPERATION :
            if (typeof message.data === 'string')
                setOperation(message.data, true);
        break;
        case UI.TRANSPORT :
            showView('transport');
        break;
        case UI.CONNECT :
            showView('connect');
        break;
        case UI.SELECT_DEVICE :
            view.selectDevice(message.data);
        break;
        case UI.SELECT_ACCOUNT :
            view.selectAccount(message.data);
        break;
        case UI.SELECT_FEE :
            view.selectFee(message.data);
        break;
        case UI.UPDATE_CUSTOM_FEE :
            view.updateCustomFee(message.data);
        break;
        case UI.INSUFFICIENT_FUNDS :
            showView('insufficient_funds');
        break;
        case UI.REQUEST_BUTTON :
            view.requestButton(message.data);
        break;

        case UI.BOOTLOADER :
            showView('bootloader');
        break;
        case UI.INITIALIZE :
            showView('initialize');
        break;
        case UI.FIRMWARE :
            showView('firmware');
        break;

        case UI.REQUEST_PERMISSION :
            view.initPermissionsView(message.data, event.origin);
        break;
        case UI.REQUEST_CONFIRMATION :
            view.initConfirmationView(message.data);
        break;
        case UI.REQUEST_PIN :
            view.initPinView();
        break;
        case UI.INVALID_PIN :
            showView('invalid_pin');
        break;
        case UI.REQUEST_PASSPHRASE :
            view.initPassphraseView();
        break;
    }
}

const initLoaderView = (message: any): void => {
    const container: HTMLElement = showView('loader');

    if (typeof message === 'string') {
        const label: HTMLElement = container.getElementsByTagName('p')[0];
        label.style.display = 'block';
        label.innerHTML = message;
    }
};



window.addEventListener('load', () => {



    view.init();

    window.addEventListener('message', handleMessage);
    postMessage(new UiMessage(POPUP.HANDSHAKE) );

    // pass popup console to iframe
    popupConsole(POPUP.LOG, postMessage);

    //view.selectFee({ list: [] });

    // global method used in html-inline elements
    window.closeWindow = () => {
        window.close();
    }
}, false);



