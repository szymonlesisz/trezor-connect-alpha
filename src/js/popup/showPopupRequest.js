/* @flow */
'use strict';

const layerID: string = 'TrezorjsInteractionLayer';

const layerInnerHtml: string = `
    <div class="trezorjs-container" id="${layerID}">
        <div class="trezorjs-window">
            <h1>Connect needs interaction</h1>
            <button class="open">CLICK</button>
            <button class="cancel">CANCEL</button>
        </div>
    </div>
`;

export const showPopupRequest = (open: () => void, cancel: () => void) => {

    if (document.getElementById(layerID)) {
        return;
    }

    let div: HTMLDivElement = document.createElement('div');
    div.id = layerID;
    div.className = 'trezorjs-container';
    div.innerHTML = layerInnerHtml;

    if (document.body) {
        document.body.appendChild(div);
    }

    let button: HTMLElement = div.getElementsByClassName('open')[0];
    button.onclick = () => {
        open();
        if (document.body)
            document.body.removeChild(div);
    }

    button = div.getElementsByClassName('cancel')[0];
    button.onclick = () => {
        cancel();
        if (document.body)
            document.body.removeChild(div);
    }

}
