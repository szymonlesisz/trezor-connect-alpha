/* @flow */
'use strict';

import { UiMessage } from '../../core/CoreMessage';
import * as UI from '../../constants/ui';
import { container, iframe, showView, postMessage } from './common';
import DataManager from '../../data/DataManager';
import type { SelectDevice } from 'flowtype/ui-message';

const initWebUsbButton = (webusb: boolean): void => {
    if (!webusb || !iframe) return;

    const webusbContainer: HTMLElement = container.getElementsByClassName('webusb')[0];
    webusbContainer.style.display = 'flex';
    const button: HTMLButtonElement = webusbContainer.getElementsByTagName('button')[0];
    button.onclick = async () => {
        const x = window.screenLeft;
        const y = window.screenTop;

        const currentWidth = window.outerWidth;
        const currentHeight = window.outerHeight;

        const restorePosition = (originalWidth: number, originalHeight: number): void => {
            window.resizeTo(originalWidth, originalHeight);
            window.moveTo(x, y);
            window.focus();
        }

        window.resizeTo(100, 100);
        window.moveTo(screen.width, screen.height);

        const usb = iframe.clientInformation.usb;
        try {
            await usb.requestDevice( { filters: DataManager.getConfig().webusb } );
            showView('loader');
            restorePosition(currentWidth, currentHeight);
        } catch (error) {
            restorePosition(currentWidth, currentHeight);
        }
    }
}

export const selectDevice = (payload: $PropertyType<SelectDevice, 'payload'>): void => {
    if (!payload) return;

    if (!payload) {
        return;
    }

    if (!payload.devices || !Array.isArray(payload.devices) || payload.devices.length === 0) {
        // No device connected
        showView('connect');
        initWebUsbButton(payload.webusb);
        return;
    }

    showView('select-device');
    initWebUsbButton(payload.webusb);

    // Populate device list
    const deviceList: HTMLElement = container.getElementsByClassName('select-device-list')[0];
    // deviceList.innerHTML = '';
    const rememberCheckbox: HTMLInputElement = (container.getElementsByClassName('remember-device')[0]: any);

    // Show readable devices first
    payload.devices.sort((d1, d2) => {
        if (d1.unreadable && !d2.unreadable) {
            return 1;
        } else if (!d1.unreadable && d2.unreadable) {
            return -1;
        }
        return 0;
    });

    payload.devices.forEach(device => {
        const deviceButton: HTMLButtonElement = document.createElement('button');
        deviceButton.className = 'list';
        if (!device.unreadable) {
            deviceButton.addEventListener('click', () => {
                postMessage(new UiMessage(UI.RECEIVE_DEVICE, {
                    remember: (rememberCheckbox && rememberCheckbox.checked),
                    device
                }));
                showView('loader');
            });
        }

        const deviceIcon: HTMLSpanElement = document.createElement('span');
        deviceIcon.className = 'icon';

        if (device.features) {
            if (device.features.model === 'T') {
                deviceIcon.classList.add('model-t');
            }
        }

        // TODO: Different icon when device is unreadable (doesn't necessary need to be a TREZOR device)
        const deviceName: HTMLSpanElement = document.createElement('span');
        deviceName.className = 'device-name';
        deviceName.textContent = device.label;

        const wrapper: HTMLDivElement = document.createElement('div');
        wrapper.className = 'wrapper';
        wrapper.appendChild(deviceIcon);
        wrapper.appendChild(deviceName);
        deviceButton.appendChild(wrapper);

        if (device.unreadable) {
            deviceButton.disabled = true;
            deviceIcon.classList.add('unknown');

            deviceButton.classList.add('device-explain');

            const explanation: HTMLDivElement = document.createElement('div');
            explanation.className = 'explain';
            explanation.innerHTML = 'Please install <a href="https://wallet.trezor.io" target="_blank">Bridge</a> to use TREZOR ONE';
            deviceButton.appendChild(explanation);
        }

        deviceList.appendChild(deviceButton);
    });
};
