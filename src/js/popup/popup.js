import { popupConsole } from '../utils/console';
import PopupMessage, {
    POPUP_LOG,
    POPUP_HANDSHAKE,
    POPUP_CONNECT,
    POPUP_REQUEST_PIN,
    POPUP_RECEIVE_PIN,
    POPUP_INVALID_PIN,
    POPUP_REQUEST_PASSPHRASE,
    POPUP_RECEIVE_PASSPHRASE,
} from '../message/PopupMessage';
import styles from  '../../styles/popup.less';

function onMessage(event: MessageEvent): void {
    console.log("onMessage", event);

    switch(event.data.type) {
        case POPUP_CONNECT :
            showView('connect');
        break;
        case POPUP_REQUEST_PIN :
            initPinView();
        break;
        case POPUP_INVALID_PIN :
            showView('invalid_pin');
        break;
        case POPUP_REQUEST_PASSPHRASE :
            initPassphraseView();
        break;
    }
}

const showView = (className: string): void => {
    clearView();

    const views = document.getElementById('views');
    const container = document.getElementById('container');
    const view = views.getElementsByClassName(className);
    container.innerHTML = view[0].outerHTML;
}

const clearView = ():void => {
    const container = document.getElementById('container');
    container.innerHTML = '';
    window.removeEventListener('keydown', pinKeyboardHandler, false);
    window.removeEventListener('keydown', passKeyboardHandler, false);
}

const passKeyboardHandler = (event):void => {
    if (event.keyCode === 13) {
        event.preventDefault();
        submit();
    }
}

const pinKeyboardHandler = (event):void => {
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

const addPinFromKeyboard = (nr):void => {
    const container = document.getElementById('container');
    const input = container.getElementsByClassName('input')[0];
    if (input.value.length < 9)
        input.value += nr;
}

const backspacePin = ():void => {
    const container = document.getElementById('container');
    const input = container.getElementsByClassName('input')[0];
    let pin = input.value;
    input.value = pin.substring(0, pin.length - 1);
}

const submit = ():void => {
    const container = document.getElementById('container');
    const button = container.getElementsByClassName('submit')[0];
    button.click();
}

const initPinView = () => {
    showView('pin');
    const container = document.getElementById('container');
    const input = container.getElementsByClassName('input')[0];
    const enter = container.getElementsByClassName('submit')[0];
    const backspace = container.getElementsByClassName('pin_backspace')[0];
    let buttons = container.querySelectorAll('[data-value]');
    let i, len = buttons.length;
    for (i = 0; i < len; i++) {
        buttons[i].addEventListener('click', event => {
            input.value += event.target.getAttribute('data-value');
        });
    }
    backspace.addEventListener('click', backspacePin);
    enter.addEventListener('click', event => {
        showView('loader');
        postMessage({ origin: 'null' }, new PopupMessage(POPUP_RECEIVE_PIN, input.value) );
    });

    window.addEventListener('keydown', pinKeyboardHandler, false);
}

const initPassphraseView = () => {
    showView('passphrase');
    const container = document.getElementById('container');
    const input = container.getElementsByClassName('input')[0];
    const checkbox = container.getElementsByClassName('passphrase_checkbox')[0];
    const enter = container.getElementsByClassName('submit')[0];

    checkbox.addEventListener('click', () => {
        input.type = (input.type === 'text') ? 'password' : 'text';
        input.focus();
    });

    enter.addEventListener('click', () => {
        showView('loader');
        postMessage({ origin: 'null' }, new PopupMessage(POPUP_RECEIVE_PASSPHRASE, input.value) );
    });

    window.addEventListener('keydown', passKeyboardHandler, false);
    input.focus();
}

const invalidPinView = () => {
    const container = document.getElementById('container');
}

const postMessage = (event, message) => {
    if(!window.opener) return;
    let origin = (event.origin !== 'null') ? event.origin : '*';
    //window.opener.frames[0].postMessage(message, origin);
    if (_iframe) {
        _iframe.postMessage(message, origin);
    } else {
        window.opener.postMessage({ type: 'error', message: "Popup couldn't establish connection with device." }, origin);
    }

}

var _iframe: HTMLElement;

window.addEventListener('load', () => {
    let iframes = window.opener.frames;
    for (let i = 0; i < iframes.length; i++) {
        try {
            if (iframes[i].location.host === window.location.host) {
                _iframe = iframes[i];
            }
        } catch(error) { }
    }
    window.addEventListener('message', onMessage, false);
    postMessage({ origin: 'null' }, new PopupMessage(POPUP_HANDSHAKE) );
    popupConsole(POPUP_LOG, postMessage);
}, false);



