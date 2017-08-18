// @flow
import AbstractContainer from './AbstractContainer';

const POPUP_INIT_TIMEOUT: Number = 15000;
const POPUP_CLOSE_INTERVAL: Number = 250;
const POPUP_WIDTH: Number = 600;
const POPUP_HEIGHT: Number = 500;

const POPUP_INNER_HTML = `
    <!doctype html>
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width" />
        <title>TREZOR Connect</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:100,400,700" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto+Mono" />
        <style>
        body, html {
            margin: 0;
            padding: 0;
        }
        </style>
    </head>
    <body>
        <div id="trezor-connect"></div>
    </body>
`;


const createWindow = () => {

    let left = (window.screen.width - POPUP_WIDTH) / 2,
        top = (window.screen.height - POPUP_HEIGHT) / 2,
        width = POPUP_WIDTH,
        height = POPUP_HEIGHT,
        opts =
            `width=${width}
            ,height=${height}
            ,left=${left}
            ,top=${top}
            ,menubar=no
            ,toolbar=no
            ,location=no
            ,personalbar=no
            ,status=no`;
    return window.open('', name, opts);
};

export default class Popup extends AbstractContainer {

    popup: HTMLElement;

    constructor(channel: ConnectChannel){
        super(channel);
    }

    async open(args: Object): Promise<any> {

        this.popup = createWindow();
        this.popup.document.body.innerHTML = POPUP_INNER_HTML;

        this.renderer.setContainer( this.popup.document.getElementById('trezor-connect') );
        this.renderer.open(args);

        var resolved: boolean = false;

        // window open timeout
        var timeout = window.setTimeout(() => {
            console.log("TODO: Window does not open!");
            if(!resolved){

            }
        }, POPUP_INIT_TIMEOUT);

        // window close listener
        var interval = window.setInterval(() => {
            if(this.popup.closed){
                window.clearInterval(interval);
                window.clearTimeout(timeout);
                this.close(resolved);
            }else if(timeout !== null && this.popup.document.body !== null){
                window.clearTimeout(timeout);
                timeout = null;
            }
        }, POPUP_CLOSE_INTERVAL);

        return await super.open(args).then(response => {
            resolved = true;
            this.popup.close();
            return response;
        });

    }

    close(resolved: boolean){
        console.log("WIDOW CLOSE!");
        this.popup = null;

        if(!resolved){
            // TODO: reject promise from this.open
        }
    }


}
