/* @flow */

import { httpRequest } from '../utils/networkUtils';
// eslint-disable-next-line no-unused-vars
import styles from '../../styles/popup.less';

import type { Config } from '../data/DataManager';

let config: Config;

const onLoad = async () => {
    config = await httpRequest('./data/config.json', 'json');
    window.top.postMessage('usb-permissions-init', '*')
}

const init = (label: string) => {

    const h3: HTMLElement = document.getElementsByTagName('h3')[0];
    h3.innerText = label;

    const usbButton: HTMLElement = document.getElementsByClassName('confirm')[0];
    const cancelButton: HTMLElement = document.getElementsByClassName('cancel')[0];

    usbButton.onclick = async () => {
        const filters = config.webusb.map(desc => {
            return {
                vendorId: parseInt(desc.vendorId),
                productId: parseInt(desc.productId)
            }
        });

        const usb = navigator.usb;
        if (usb) {
            try {
                await usb.requestDevice({filters});
                window.top.postMessage('usb-permissions-close', '*');
            } catch (error) {
                console.log('Webusb', error);
            }
        }
    };

    cancelButton.onclick = () => {
        window.top.postMessage('usb-permissions-close', '*');
    }
}

const handleMessage = (message: MessageEvent) => {
    const data: any = message.data;
    if (data && data.type === 'usb-permissions-init') {
        window.removeEventListener('message', handleMessage, false);
        const knownHost = config.knownHosts.find(host => host.origin === data.extension);
        const label: string = knownHost && knownHost.label ? knownHost.label : message.origin;
        init(label);
    }
}

window.addEventListener('load', onLoad, false);
window.addEventListener('message', handleMessage, false);

