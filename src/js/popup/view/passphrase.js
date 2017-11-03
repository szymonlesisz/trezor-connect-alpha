/* @flow */
'use strict';

import { UiMessage } from '../../core/CoreMessage';
import * as UI from '../../constants/ui';
import { container, showView, postMessage } from './common';

export const initPassphraseView = (): void => {
    showView('passphrase');
    const input: HTMLInputElement = (container.getElementsByClassName('input')[0]: any);
    const checkbox: HTMLElement = container.getElementsByClassName('passphrase_checkbox')[0];
    const enter: HTMLElement = container.getElementsByClassName('submit')[0];

    checkbox.addEventListener('click', () => {
        input.type = (input.type === 'text') ? 'password' : 'text';
        input.focus();
    });

    enter.addEventListener('click', () => {
        window.removeEventListener('keydown', passKeyboardHandler);
        showView('loader');
        postMessage(new UiMessage(UI.RECEIVE_PASSPHRASE, input.value) );
    });

    window.addEventListener('keydown', passKeyboardHandler, false);
    input.focus();
}

const passKeyboardHandler = (event: KeyboardEvent): void => {
    if (event.keyCode === 13) {
        event.preventDefault();
        submit();
    }
}

const submit = (): void => {
    const button = container.getElementsByClassName('submit')[0];
    button.click();
}
