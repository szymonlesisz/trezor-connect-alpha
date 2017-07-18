import React from 'react';
import ReactDOM from 'react-dom';
import EventEmitter from '../events/EventEmitter';

import ConfirmComponent from './components/ConfirmComponent';
import PinComponent from './components/PinComponent';
import XPubComponent from './components/XPubComponent';
import LoaderComponent from './components/LoaderComponent';

export default class ViewRenderer extends EventEmitter {

    container: HTMLElement;
    currentComponent: Object;
    props: Object;

    constructor(container: HTMLElement){
        super();
        this.container = container;
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
    showAlert(): void {

    }

    // show confirmation
    showConfirmPromt(type: string): void {
        this.currentComponent = ConfirmComponent;
        this.render();
        //ReactDOM.render(<ConfirmComponent {...this.args} />, this.container);
    }

    showXPubConfirm(): void {

    }

    requestConfirm(data: Object): void {
        console.log("ui request confirm", data);
        this.currentComponent = XPubComponent;
        this.props = { ...this.props, ...data, showLoader: () => { this.showLoader() } };
        this.render();
    }

    requestPin(callback: Function): void {
        this.currentComponent = PinComponent;
        this.props = { ...this.props, showLoader: () => { this.showLoader() }, callback: callback };
        this.render();
        //ReactDOM.render(<PinComponent {...this.args} showLoader={ () => { this.showLoader(); } } callback={ callback } />, this.container);
    }

    showLoader(): void {
        this.currentComponent = LoaderComponent;
        this.render();
        //ReactDOM.render(<LoaderComponent {...this.args} />, this.container);
    }

    render(): void {
        let component = React.createElement(this.currentComponent, this.props);
        //this.currentComponent.props
        ReactDOM.render(component, this.container);
    }

    close(): void {
        while(this.container.firstChild){
            this.container.removeChild(this.container.firstChild);
        }
    }
}
