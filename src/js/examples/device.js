/* @flow */
'use strict';

const nav: HTMLElement = document.getElementsByTagName('nav')[0];
let selectedDevice: string;

const render = (devices: Array<Object>): void => {

    const li: HTMLCollection = nav.getElementsByTagName('li');
    const empty: HTMLElement = li[0];
    const ul: HTMLElement = empty.parentNode;

    // clear list
    while(li.length > 1) {
        ul.removeChild(li[1]);
    }

    if (devices.length < 1) {
        empty.style.display = 'block';
    } else {
        empty.style.display = 'none';
        let i: number;
        let dev: Object;
        for (i = 0; i < devices.length; i++) {
            let newLi: HTMLElement = document.createElement("li");
            dev = devices[i];
            newLi.setAttribute("data-path", dev.path);
            newLi.innerHTML = devices[i].label;
            if (dev.unacquired) {
                newLi.classList.add("unacquired");
            }
            if (dev.isUsedElsewhere) {
                newLi.classList.add("used-elsewhere");
            }
            if (dev.featuresNeedsReload) {
                newLi.classList.add("reload-features");
            }

            if (dev.path === selectedDevice) {
                newLi.classList.add("active");
            }
            ul.appendChild(newLi);

            newLi.addEventListener('click', selectDevice);
        }
    }
}


const selectDevice = (event: MouseEvent): void => {

    const target: HTMLElement = (event.target : any);

    if (target.classList.contains('active')) {
        return;
    }

    var li = nav.querySelectorAll('.active');
    // remove all 'active' classnames
    [].forEach.call(li, (current: HTMLElement): void => {
        current.classList.remove('active');
    });

    selectedDevice = target.getAttribute("data-path");
}
