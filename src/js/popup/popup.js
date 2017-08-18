import { popupConsole } from '../utils/console';
import PopupMessage, { POPUP_LOG, POPUP_HANDSHAKE, POPUP_REQUEST_PIN, POPUP_RECEIVE_PIN } from './PopupMessage';

function onMessage(event: MessageEvent): void {
    console.log("onMessage", event);

    switch(event.data.type) {
        case POPUP_REQUEST_PIN :
            console.log("SHOW PIN2");
            initPinView();
        break;
    }
}

const initPinView = () => {
    let pin = document.getElementById("pin");
    pin.style.display = 'block';

    let input = document.getElementById('pin_input');
    let enter = document.getElementById('pin_enter');

    console.log("init pin view");

    let buttons = pin.querySelectorAll('[data-value]');
    //console.log("init pin view", Array.isArray(buttons), typeof buttons, buttons);

    for (let i = 0; i < buttons.length; i++) {
    //for(let b of buttons) {
        let b = buttons[i];
        console.log("BUTT", b)
        b.addEventListener('click', event => {
            console.log("Pin button click", event.target, event.target.getAttribute('data-value'))
            input.value += event.target.getAttribute('data-value');
        });
    }
    console.log("buttons inited")
    enter.addEventListener('click', event => {
        postMessage({ origin: 'null' }, new PopupMessage(POPUP_RECEIVE_PIN, input.value) );
    })

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



