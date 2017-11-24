/* @flow */
'use strict';


import TrezorConnect from '../entrypoints/library';

import * as UI from '../constants/ui';
import { INVALID_PIN } from '../constants/ui';
import { UiMessage } from '../core/CoreMessage';
import { UI_EVENT } from '../core/CoreMessage';
import { httpRequest } from '../utils/networkUtils';


const container: HTMLElement = (document.querySelector('.modal-container') : any);
const win: HTMLElement = (document.querySelector('.modal-window') : any);

export const initModal = () => {
    TrezorConnect.on(UI_EVENT, handleModalEvent);
}

const handleModalEvent = (type, data) => {
    switch (type) {
        case UI.REQUEST_UI_WINDOW :
            //openModal();
            TrezorConnect.uiMessage({ type: 'popup_handshake' });
        break;

        case UI.CLOSE_UI_WINDOW :
            closeModal();
        break;

        case UI.REQUEST_PIN :
            showPin();
        break;

        case UI.INVALID_PIN :
            invalidPin();
        break;

        case UI.REQUEST_PASSPHRASE :
            showPassphrase();
        break;

        // case 'ui-request_permission' :
        //     requestPermissions(data);
        // break;

        // case 'ui-request_confirmation' :
        //     requestConfirmation(data);
        // break;

        // case 'ui-select_account' :
        //     console.log("DATA", data)
        // break;
    }
}

const openModal = async () => {
    container.classList.add('opened');
    win.innerHTML = '';
    //TrezorConnect.uiMessage({ type: 'popup_handshake' });
}

const closeModal = async () => {
    container.classList.remove('opened');
    win.innerHTML = '';

    window.removeEventListener('keydown', pinKeyboardHandler, false);
}

const showPin = async () => {
    openModal();

    await loadView('views/modal/pin.html');

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
    }

    for (i = 0; i < len; i++) {
        buttons.item(i).addEventListener('click', handleClick);
    }

    backspace.addEventListener('click', backspacePin);

    enter.addEventListener('click', (event: MouseEvent) => {

        closeModal();

        TrezorConnect.uiMessage( new UiMessage(UI.RECEIVE_PIN, input.value) );

    });

    window.addEventListener('keydown', pinKeyboardHandler, false);
}

const invalidPin = () => {
    openModal();
    win.innerHTML = 'Invalid pin';
}

const showPassphrase = async () => {
    openModal();
    await loadView('views/modal/passphrase.html');

    const input: HTMLInputElement = container.getElementsByTagName('input')[0];
    const show_passphrase: HTMLElement = container.getElementsByClassName('show_passphrase')[0];
    const save_passphrase: HTMLInputElement = (container.getElementsByClassName('save_passphrase')[0]: any);
    const enter: HTMLElement = container.getElementsByClassName('submit')[0];

    const DOT: string = '•';
    let password: boolean = true;
    let passValue: string = '';

    const onFocusIn = (): void => {
        input.setAttribute('type', 'password');
        input.value = passValue;
    }
    const onFocusOut = (): void => {
        passValue = input.value;
        input.setAttribute('type', 'text');
        input.value = passValue.replace(/./g, DOT);
    }

    input.addEventListener('focusin', onFocusIn, false);
    input.addEventListener('focusout', onFocusOut, false);

    show_passphrase.addEventListener('click', () => {
        if (password) {
            password = false;
            input.setAttribute('type', 'text');
            input.value = passValue;
            input.removeEventListener('focusin', onFocusIn, false);
            input.removeEventListener('focusout', onFocusOut, false);
        } else {
            password = true;
            input.value = passValue.replace(/./g, DOT);
            input.addEventListener('focusin', onFocusIn, false);
            input.addEventListener('focusout', onFocusOut, false);
        }
        input.focus();
    });

    enter.addEventListener('click', () => {
        input.blur();

        window.removeEventListener('keydown', passKeyboardHandler);
        input.removeEventListener('focusin', onFocusIn, false);
        input.removeEventListener('focusout', onFocusOut, false);

        closeModal();

        TrezorConnect.uiMessage( new UiMessage(UI.RECEIVE_PASSPHRASE, {
            save: save_passphrase.checked,
            value: passValue,
        }) );
    });

    const passKeyboardHandler = (event: KeyboardEvent): void => {
        if (event.keyCode === 13) {
            event.preventDefault();
            input.blur();
            submit();
        }
    }

    window.addEventListener('keydown', passKeyboardHandler, false);
    input.focus();

}

const loadView = async (url: string) => {
    const html: string = await httpRequest(url, 'text');
    win.innerHTML = html;
}



//

const submit = (): void => {
    const button = container.getElementsByClassName('submit')[0];
    button.click();
}

const addPinFromKeyboard = (nr: number): void => {
    const input: HTMLInputElement = (container.getElementsByClassName('input')[0]: any);
    if (input.value.length < 9)
        input.value += nr;
}

const backspacePin = (): void => {
    const input: HTMLInputElement = (container.getElementsByClassName('input')[0]: any);
    let pin = input.value;
    input.value = pin.substring(0, pin.length - 1);
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

