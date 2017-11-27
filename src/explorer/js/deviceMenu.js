/* @flow */
'use strict';

const nav: HTMLElement = document.getElementsByTagName('nav')[0];

var _devices: Array<Object> = [];
var _selectedDevice: string;

function findDeviceIndexByPath(path: string): number {
    var index = -1;
    for (var i = 0; i < _devices.length; i++) {
        if (_devices[i].path === path) {
            index = i;
            break;
        }
    }
    return index;
}

export const onDeviceConnect = (device: Object): void => {
    var index = findDeviceIndexByPath(device.path);
    if (index > -1) {
        _devices[index] = device;
    } else {
        _devices.push(device);
    }
    render();
}

export const onDeviceDisconnect = (device: Object): void => {
    if (_selectedDevice === device.path) {
        _selectedDevice = undefined;
        // expose to global
        window.selectedDevice = _selectedDevice;
    }

    var index = findDeviceIndexByPath(device.path);
    if (index > -1) {
        _devices.splice(index, 1);
    }
    render();
}

export const onDeviceUsedElsewhere = (device) => {
    var index = findDeviceIndexByPath(device.path);
    var needRedraw = false;
    if (index > -1) {
        _devices[index] = device;
        needRedraw = true;
    }
    if (needRedraw)
        render();
}

export const render = (): void => {

    const li: HTMLCollection = nav.getElementsByTagName('li');
    const empty: HTMLElement = li[0];
    const ul: HTMLElement = empty.parentNode;

    // clear list
    while(li.length > 1) {
        ul.removeChild(li[1]);
    }

    if (_devices.length < 1) {
        empty.style.display = 'block';
    } else {
        empty.style.display = 'none';
        let i: number;
        let dev: Object;
        for (i = 0; i < _devices.length; i++) {
            let newLi: HTMLElement = document.createElement("li");
            dev = _devices[i];
            newLi.setAttribute("data-path", dev.path);
            newLi.innerHTML = _devices[i].label;
            if (dev.unacquired) {
                newLi.classList.add("unacquired");
            }
            if (dev.isUsedElsewhere) {
                newLi.classList.add("used-elsewhere");
            }
            if (dev.featuresNeedsReload) {
                newLi.classList.add("reload-features");
            }

            if (dev.path === _selectedDevice) {
                newLi.classList.add("active");
            }
            ul.appendChild(newLi);

            newLi.addEventListener('click', selectDevice);
        }
    }

    // set single device as active
    if(!_selectedDevice && _devices.length === 1) {
        //li[1].click();
        li[1].classList.add("active");
    }
}


const selectDevice = (event: MouseEvent): void => {

    const target: HTMLElement = (event.currentTarget : any);

    if (target.classList.contains('active')) {
        target.classList.remove('active');
        _selectedDevice = undefined;
        window.selectedDevice = _selectedDevice;
        return;
    }

    var li = nav.querySelectorAll('.active');
    // remove all 'active' classnames
    [].forEach.call(li, (current: HTMLElement): void => {
        current.classList.remove('active');
    });
    target.classList.add('active');

    _selectedDevice = target.getAttribute("data-path");

    // expose to global
    window.selectedDevice = _selectedDevice;
}
