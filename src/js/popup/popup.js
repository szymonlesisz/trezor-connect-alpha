/* @flow */
'use strict';

import { popupConsole } from '../utils/debug';
import { parseMessage, UiMessage } from '../channel/ChannelMessage';
import type { ChannelMessage } from '../channel/ChannelMessage';

import * as POPUP from '../constants/popup';
import * as UI from '../constants/ui';
import styles from  '../../styles/popup.less';


const handleMessage = (event: MessageEvent): void => {

    // ignore messages from domain other then parent.window
    if (event.origin !== window.opener.location.origin) return;

    console.log("handleMessage", event.data);

    let message: ChannelMessage = parseMessage(event.data);

    // TODO parse incoming strings to avoid string injections !!!

    switch(message.type) {
        case UI.LOADING :
            //showView('loader');
            initLoaderView(message.data);
        break;
        case UI.TRANSPORT :
            showView('transport');
        break;
        case UI.CONNECT :
            showView('connect');
        break;
        case UI.SELECT_DEVICE :
            initDeviceSelectionView(message.data);
        break;
        case UI.SELECT_ACCOUNT :
            initAccountSelectionView(message.data);
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
            initPermissionsView(message.data, event.origin);
        break;
        case UI.REQUEST_CONFIRMATION :
            initConfirmationView(message.data);
        break;
        case UI.REQUEST_PIN :
            initPinView();
        break;
        case UI.INVALID_PIN :
            showView('invalid_pin');
        break;
        case UI.REQUEST_PASSPHRASE :
            initPassphraseView();
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

const setOperationView = (message: string, origin: string, icon?: string): void => {

}

const showView = (className: string): HTMLElement => {
    clearView();

    const views: HTMLElement = (document.getElementById('views'): any);
    const container: HTMLElement = (document.getElementById('container'): any);

    const view: HTMLCollection<HTMLElement> = views.getElementsByClassName(className);
    if (view) {
        container.innerHTML = view.item(0).outerHTML;
    } else {
        const unknown: HTMLCollection<HTMLElement> = views.getElementsByClassName('unknown-view');
        container.innerHTML = unknown.item(0).outerHTML;
    }
    return container;
}

const clearView = (): void => {
    const container: HTMLElement = (document.getElementById('container'): any);
    container.innerHTML = '';
    window.removeEventListener('keydown', pinKeyboardHandler, false);
    window.removeEventListener('keydown', passKeyboardHandler, false);
}

const passKeyboardHandler = (event: KeyboardEvent): void => {
    if (event.keyCode === 13) {
        event.preventDefault();
        submit();
    }
}

const pinKeyboardHandler = (event: KeyboardEvent): void => {
    event.preventDefault();
    switch (event.keyCode) {
        case 13 :
            // enter,
            submit();
            break;
        // backspace
        case 8 :
            backspacePin();
            break;

        // numeric and numpad
        case 49 :
        case 97 :
            addPinFromKeyboard(1);
            break;
        case 50 :
        case 98 :
            addPinFromKeyboard(2);
            break;
        case 51 :
        case 99 :
            addPinFromKeyboard(3);
            break;
        case 52 :
        case 100 :
            addPinFromKeyboard(4);
            break;
        case 53 :
        case 101 :
            addPinFromKeyboard(5);
            break;
        case 54 :
        case 102 :
            addPinFromKeyboard(6);
            break;
        case 55 :
        case 103 :
            addPinFromKeyboard(7);
            break;
        case 56 :
        case 104 :
            addPinFromKeyboard(8);
            break;
        case 57 :
        case 105 :
            addPinFromKeyboard(9);
            break;
    }
}

const addPinFromKeyboard = (nr: number): void => {
    const container: HTMLElement = (document.getElementById('container'): any);
    const input: HTMLInputElement = (container.getElementsByClassName('input')[0]: any);
    if (input.value.length < 9)
        input.value += nr;
}

const backspacePin = (): void => {
    const container: HTMLElement  = (document.getElementById('container'): any);
    const input: HTMLInputElement = (container.getElementsByClassName('input')[0]: any);
    let pin = input.value;
    input.value = pin.substring(0, pin.length - 1);
}

const submit = (): void => {
    const container: HTMLElement = (document.getElementById('container'): any);
    const button = container.getElementsByClassName('submit')[0];
    button.click();
}

const initPinView = (): void => {
    showView('pin');

    const container: HTMLElement = (document.getElementById('container'): any);
    const input: HTMLInputElement= (container.getElementsByClassName('input')[0] : any);
    const enter: HTMLElement = container.getElementsByClassName('submit')[0];
    const backspace: HTMLElement = container.getElementsByClassName('pin_backspace')[0];
    const buttons: NodeList<HTMLElement> = container.querySelectorAll('[data-value]');

    let i: number;
    let len: number = buttons.length;

    const handleClick = (event: MouseEvent) => {
        if (event.target instanceof HTMLElement) {
            let val: ?string = event.target.getAttribute('data-value');
            if (val)
                input.value += val;
        }
        showView('loader');
    }

    for (i = 0; i < len; i++) {
        buttons.item(i).addEventListener('click', handleClick);
    }

    backspace.addEventListener('click', backspacePin);

    enter.addEventListener('click', (event: MouseEvent) => {
        showView('loader');
        postMessage(new UiMessage(UI.RECEIVE_PIN, input.value) );
    });

    window.addEventListener('keydown', pinKeyboardHandler, false);
}

const initPassphraseView = (): void => {
    showView('passphrase');
    const container: HTMLElement = (document.getElementById('container'): any);
    const input: HTMLInputElement = (container.getElementsByClassName('input')[0]: any);
    const checkbox: HTMLElement = container.getElementsByClassName('passphrase_checkbox')[0];
    const enter: HTMLElement = container.getElementsByClassName('submit')[0];

    checkbox.addEventListener('click', () => {
        input.type = (input.type === 'text') ? 'password' : 'text';
        input.focus();
    });

    enter.addEventListener('click', () => {
        showView('loader');
        postMessage(new UiMessage(UI.RECEIVE_PASSPHRASE, input.value) );
    });

    window.addEventListener('keydown', passKeyboardHandler, false);
    input.focus();
}

const initDeviceSelectionView = (list: ?Object): void => {

    if (!list) return;

    if (list.length === 0) {
        showView('connect');
        return;
    }
    showView('select_device');

    const container: HTMLElement = (document.getElementById('container'): any);
    const buttonsContainer: HTMLElement = container.getElementsByClassName('select_device_list')[0];

    const handleClick = (event: MouseEvent) => {
        if (event.target instanceof HTMLElement) {
            postMessage(new UiMessage(UI.RECEIVE_DEVICE, event.target.getAttribute('data-path')) );
        }
        showView('loader');
    }

    for (let dev of list) {
        let button: HTMLButtonElement = document.createElement('button');
        button.innerHTML = dev.label;
        button.onclick = handleClick;
        button.setAttribute('data-path', dev.path);
        buttonsContainer.appendChild(button);
    }
}

const initPermissionsView = (data: any, origin: string): void => {
    showView('permissions');

    const container: HTMLElement = (document.getElementById('container'): any);
    const h3: HTMLElement = container.getElementsByTagName('h3')[0];
    const hostName: HTMLElement = h3.getElementsByTagName('span')[0];
    const list: HTMLElement = container.getElementsByClassName('permissions_list')[0];
    const confirmButton: HTMLElement = container.getElementsByClassName('confirm_button')[0];
    const cancelButton: HTMLElement = container.getElementsByClassName('cancel_button')[0];

    hostName.innerHTML = origin;
    console.warn("ORIGIN", origin)
    if (data && Array.isArray(data)) {
        const ul: HTMLUListElement = document.createElement('ul');
        ul.className = 'permissions_list';
        for (let p of data) {
            let li: HTMLLIElement = document.createElement('li');
            li.innerHTML = p;
            ul.append(li);
        }
        list.append(ul);
    }

    confirmButton.onclick = () => {
        postMessage(new UiMessage(UI.RECEIVE_PERMISSION, 'true') );
        showView('loader');
    }

    cancelButton.onclick = () => {
        postMessage(new UiMessage(UI.RECEIVE_PERMISSION, 'false') );
        showView('loader');
    }
}

const initConfirmationView = (data: any): void => {

    showView(data.view);

    const container: HTMLElement = (document.getElementById('container'): any);
    const h3: HTMLElement = container.getElementsByTagName('h3')[0];
    const confirmButton: HTMLElement = container.getElementsByClassName('confirm_button')[0];
    const cancelButton: HTMLElement = container.getElementsByClassName('cancel_button')[0];

    h3.innerHTML = `Export xpub for ${ data.label }`;

    confirmButton.onclick = () => {
        postMessage(new UiMessage(UI.RECEIVE_CONFIRMATION, 'true') );
        showView('loader');
    }

    cancelButton.onclick = () => {
        postMessage(new UiMessage(UI.RECEIVE_CONFIRMATION, 'false') );
        showView('loader');
    }
}


const initAccountSelectionView = (list: ?Object): void => {

    if (!list) return;
    if (list.length === 0) {
        //showView('loader');
        initLoaderView('Loading accounts...');
        return;
    }
    showView('select_account');

    const container: HTMLElement = (document.getElementById('container'): any);
    const buttonsContainer: HTMLElement = container.getElementsByClassName('select_account_list')[0];

    const handleClick = (event: MouseEvent) => {
        if (event.target instanceof HTMLElement) {
            postMessage(new UiMessage(UI.RECEIVE_ACCOUNT, event.target.getAttribute('data-account')) );
        }
        showView('loader');
    }

    for (let account of list) {
        let button: HTMLButtonElement = document.createElement('button');
        button.innerHTML = account.label;
        button.onclick = handleClick;
        button.setAttribute('data-account', account.id);
        buttonsContainer.appendChild(button);
    }
}


const postMessage = (message: ChannelMessage): void => {
    if (!window.opener || !_iframe) return;

    if (_iframe) {
        _iframe.postMessage(message, '*');
        //_iframe.contentWindow.postMessage(message, '*');
    } else {
        // TODO: post channel message
        window.opener.postMessage({ type: 'error', message: "Popup couldn't establish connection with iframe." }, '*');
    }
}

//var _iframe: HTMLIFrameElement;
var _iframe: any; // Window type

window.addEventListener('load', () => {

    // find iframe
    let iframes: HTMLCollection<any> = window.opener.frames;

    for (let i = 0; i < iframes.length; i++) {
        try {
            if (iframes[i].location.host === window.location.host) {
                //TODO: console.log( window.opener.document.getElementById('trezorjs-iframe'))
                _iframe = iframes[i];
            }
        } catch(error) { }
    }

    window.addEventListener('message', handleMessage);
    postMessage(new UiMessage(POPUP.HANDSHAKE) );

    // pass popup console to iframe
    popupConsole(POPUP.LOG, postMessage);

    // global method used in html-inline elements
    window.closeWindow = () => {
        window.close();
    }
}, false);



