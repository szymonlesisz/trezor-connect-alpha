/* @flow */
'use strict';

import { httpRequest } from './networkUtils';

// https://www.ynonperek.com/2017/08/24/vanilla-single-page-router-architecture/

export const init = (): void => {
    new Router(
        {
            composetx: new Page('composetx.html'),
            xpub: new Page('getxpub.html'),
            custom: new Page('custom.html'),
            accountinfo: new Page('empty.html'),
            showaddress: new Page('empty.html'),
            requestlogin: new Page('empty.html'),
            signmsg: new Page('empty.html'),
            signmsg_eth: new Page('empty.html'),
            cipherkv: new Page('empty.html'),
            signtx: new Page('empty.html'),
            signtx_opreturn: new Page('empty.html'),
            signtx_multisig: new Page('empty.html'),
            signtx_eth: new Page('empty.html'),
            signtx_nem: new Page('empty.html'),
            empty: new Page('empty.html'),
            '#default': new Page('composetx.html'),
        },
        document.querySelector('.method-params')
    );
}

let observer: number;

const initPage = (element: HTMLElement, pageName: string) => {

    // remove old callbacks
    if (observer)
        clearInterval(observer);


    // find inline script
    let script: HTMLElement = element.getElementsByTagName('script')[0];
    let js: string = script.innerHTML;

    // recreate script from string
    let newScript: HTMLScriptElement = document.createElement('script');
    newScript.type = 'text/javascript';
    let newScriptText: Text = document.createTextNode(js);
    newScript.appendChild(newScriptText);
    element.appendChild(newScript);
    // remove old script tag
    element.removeChild(script);

    console.log("EVEL", eval(js));

    // let f = new Function(js);
    // f.apply(null);

    // const code: HTMLElement = document.getElementById('code');
    // var observer = setInterval(function() {
    //     console.log("OBSERV", script, js);
    //     // if (getComputedStyle(code, null).display === 'block') {
    //     //     var html = 'TrezorConnect.customCall(' + JSON.stringify(getParams(), undefined, 2) + ');';
    //     //     if (code.innerHTML !== html)
    //     //         code.innerHTML = html;
    //     // }
    // }, 1000);


    // update navigation
    const li = document.querySelectorAll('.methods ul li');
    // remove all 'active' classnames
    [].forEach.call(li, (current: HTMLElement): void => {
        current.classList.remove('active');
    });

    if (pageName === '#default') {
        li[0].classList.add('active');
    } else {
        document.querySelectorAll(`[data-id="${pageName}"]`)[0].classList.add('active');
    }

    // switch tabs
    const div = document.querySelector('.method-result');
    div.classList.add('response');
    div.classList.remove('code');

    // start interval
}

export default class Router {

    routes: { [ key: string ]: Page };
    container: HTMLElement;

    constructor(routes: { [ key: string ]: Page }, element: HTMLElement) {
        this.routes = routes;
        this.container = element;
        window.onhashchange = this.onHashChanged.bind(this);
        this.onHashChanged();
    }

    async onHashChanged(event): Promise<void> {
        if (window.location.hash.length > 0) {
            let pageName: string = window.location.hash.substr(1);
            if (!this.routes[pageName]) {
                window.location.hash = '';
                await this.show('#default');
                return;
            }
            await this.show(pageName);
        } else if (this.routes['#default']) {
            await this.show('#default');
        }
    }

    async show(pageName: string): Promise<void> {
        const page = this.routes[pageName];
        await page.load();
        this.container.innerHTML = '';
        page.show(this.container, pageName);
    }
}

export class Page {

    url: string;
    html: string;

    constructor(url: string) {
        this.url = 'views/' + url;
    }

    async load(): Promise<void> {
        this.html = await httpRequest(this.url, 'text');
    }

    show(element: HTMLElement, pageName: string) {
        element.innerHTML = this.html;
        initPage(element, pageName);
    }
}
