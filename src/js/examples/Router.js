/* @flow */
'use strict';

import { httpRequest } from '../utils/networkUtils';

// https://www.ynonperek.com/2017/08/24/vanilla-single-page-router-architecture/

export const init = (callback: () => void): void => {
    new Router(
        {
            composetx: new Page('composetx.html'),
            xpub: new Page('getxpub.html'),
            accountinfo: new Page('empty.html'),
            showaddress: new Page('empty.html'),
            requestlogin: new Page('composetx.html'),
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
        document.querySelector('.method-params'),
        callback
    );
}

const initPage = (element: HTMLElement, pageName: string) => {

    // remove old references
    window.showSourceCode = null;

    // find inline script
    let script: HTMLElement = element.getElementsByTagName('script')[0];
    let js: string = script.innerHTML;
    // recreate script from string
    let newScript: HTMLScriptElement = document.createElement('script');
    newScript.type = 'text/javascript';
    let newScriptText: Text = document.createTextNode(js);
    newScript.appendChild(newScriptText);
    element.appendChild(newScript);
    // remove old script
    element.removeChild(script);


    // find <pre>
    let pre: HTMLPreElement = element.getElementsByTagName('pre')[0];
    let jsCode: string = pre.innerHTML;

    element.removeChild(pre);

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
}

export default class Router {

    routes: { [ key: string ]: Page };
    container: HTMLElement;
    onUpdate: () => void;

    constructor(routes: { [ key: string ]: Page }, element: HTMLElement, onUpdate: () => void) {
        this.routes = routes;
        this.container = element;
        this.onUpdate = onUpdate;
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

        // find and run inline <script>
        // var js = el.getElementsByTagName('script')[0].innerHTML;
        // var oScript = document.createElement("script");
        // var oScriptText = document.createTextNode(js);
        // oScript.appendChild(oScriptText);
        // el.appendChild(oScript);

        // find and update code snippet
        // var code = el.getElementsByTagName('pre')[0].innerHTML;
        // console.log("PREE", code)

    }
}
