// @flow
import EventEmitter from '../events/EventEmitter';

import { h, render as PreactRender } from 'preact';
import AlertComponent from './preact-components/AlertComponent';
import DeviceInstructionsComponent from './preact-components/DeviceInstructionsComponent';
import PinComponent from './preact-components/PinComponent';
import XPubKeyComponent from './preact-components/XPubKeyComponent';
import XPubAccountListComponent from './preact-components/XPubAccountListComponent';
import LoaderComponent from './preact-components/LoaderComponent';

import css from './styles/style.less.js';

/**
 * Class responsible for UI rendering
 */
export default class ViewRenderer extends EventEmitter {

    container: HTMLElement;
    currentComponent: Object;
    props: Object;

    constructor(){
        super();
    }

    injectStyleSheet(): void {
        let doc = this.container.ownerDocument;
        let head = doc.head || doc.getElementsByTagName('head')[0];
        let style = document.createElement('style');
        style.type = 'text/css';
        if (style.styleSheet){
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        head.append(style);

        console.log("STYLEZ", css )
    }

    setContainer(container: HTMLElement): void {
        this.container = container;
        this.injectStyleSheet();
    }

    open(args: Object): void {
        this.props = args;
        this.showLoader();
    }

    showOperation(type: string): void {
        this.props = { ...this.props, operation: type };
        this.render();
    }

    // show text info
    showAlert(type: string): void {
        if(this.currentComponent !== AlertComponent){
            this.currentComponent = AlertComponent;
            this.props = { ...this.props, alertType: type };
            this.render();
            console.log("ALERTT!", type)
        }

    }

    // show confirmation
    showConfirmPromt(type: string): void {
        this.currentComponent = DeviceInstructionsComponent;
        this.render();
    }

    updateView(data: any): void {
        if(this.props.type === 'xpubAccountList'){
            if(this.props.nodes !== undefined){
                this.props.nodes.push(data);
            }else{
                this.props = { ...this.props, nodes: [ data ] };
            }
        }
        this.render();
    }

    requestConfirm(data: Object): void {
        if(data.type === 'xpubKey'){
            this.currentComponent = XPubKeyComponent;
        }else if(data.type === 'xpubAccountList'){
            this.currentComponent = XPubAccountListComponent;
        }

        this.props = { ...this.props, ...data, showLoader: () => { this.showLoader() } };
        this.render();
    }

    requestPin(callback: Function): void {
        this.currentComponent = PinComponent;
        this.props = { ...this.props, showLoader: () => { this.showLoader() }, callback: callback };
        this.render();
    }

    showLoader(): void {
        this.currentComponent = LoaderComponent;
        this.render();
    }

    render(): void {
        let component = h(this.currentComponent, this.props)
        PreactRender(component, this.container, this.container.lastChild);
    }

    close(): void {
        while(this.container.firstChild){
            this.container.removeChild(this.container.firstChild);
        }
    }

}
