import { popupConsole } from '../utils/console';
import PopupMessage, { POPUP_LOG, POPUP_HANDSHAKE, POPUP_REQUEST_PIN, POPUP_RECEIVE_PIN, POPUP_INVALID_PIN } from './PopupMessage';
import styles from  '../../styles/popup.less';

function onMessage(event: MessageEvent): void {
    console.log("onMessage", event);

    switch(event.data.type) {
        case POPUP_REQUEST_PIN :
            showView('pin');
            initPinView();
        break;
        case POPUP_INVALID_PIN :
            showView("invalid-pin");
        break;
    }
}

const showView = (className: string): void => {
    const views = document.getElementById('views');
    const container = document.getElementById('container');
    const view = views.getElementsByClassName(className);
    container.innerHTML = view[0].outerHTML;
}

const initPinView = () => {
    const container = document.getElementById('container');

    let input = container.getElementsByClassName('pin_input')[0];
    let enter = container.getElementsByClassName('pin_enter')[0];

    let buttons = container.querySelectorAll('[data-value]');
    //console.log("init pin view", Array.isArray(buttons), typeof buttons, buttons);

    for (let i = 0; i < buttons.length; i++) {
    //for(let b of buttons) {
        let b = buttons[i];
        b.addEventListener('click', event => {
            console.log("Pin button click", event.target, event.target.getAttribute('data-value'))
            input.value += event.target.getAttribute('data-value');
        });
    }
    console.log("buttons inited")
    enter.addEventListener('click', event => {
        postMessage({ origin: 'null' }, new PopupMessage(POPUP_RECEIVE_PIN, input.value) );
    });
}

const invalidPinView = () => {
    const container = document.getElementById('container');
}

const postMessage = (event, message) => {
    if(!window.opener) return;
    let origin = (event.origin !== 'null') ? event.origin : '*';
    //event.source.postMessage(message, origin);
    window.opener.postMessage(message, origin);
}

window.addEventListener('load', () => {
    window.addEventListener('message', onMessage, false);
    postMessage({ origin: 'null' }, new PopupMessage(POPUP_HANDSHAKE) );
    popupConsole(POPUP_LOG, postMessage);
}, false);



