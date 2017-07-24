// @flow
import EventEmitter from '../events/EventEmitter';

import { h, render as PreactRender } from 'preact';
import AlertComponent from './preact-components/AlertComponent';
import DeviceInstructionsComponent from './preact-components/DeviceInstructionsComponent';
import PinComponent from './preact-components/PinComponent';
import XPubComponent from './preact-components/XPubComponent';
import LoaderComponent from './preact-components/LoaderComponent';

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

    setContainer(container: HTMLElement): void {
        this.container = container;
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

    showXPubConfirm(): void {

    }

    requestConfirm(data: Object): void {
        this.currentComponent = XPubComponent;
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
