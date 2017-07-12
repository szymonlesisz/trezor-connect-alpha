import React from 'react';
import ReactDOM from 'react-dom';
import EventEmitter from '../events/EventEmitter';

import ConfirmComponent from './components/ConfirmComponent';
import PinComponent from './components/PinComponent';
import LoaderComponent from './components/LoaderComponent';

export default class ConnectUI extends EventEmitter {

    container: HTMLElement;

    constructor(container: HTMLElement){
        super();
        this.container = container;
    }

    setContainer(container: HTMLElement): void {
        this.container = container;
    }

    open(): void {
        ReactDOM.render(<LoaderComponent />, this.container);
    }

    showConfirmPromt(): void {
        ReactDOM.render(<ConfirmComponent />, this.container);
    }

    showPin(callback){
        ReactDOM.render(<PinComponent showLoader={ () => { this.showLoader(); } } callback={ callback } />, this.container);
    }

    showLoader(){
        ReactDOM.render(<LoaderComponent />, this.container);
    }

    close(){
        while(this.container.firstChild){
            this.container.removeChild(this.container.firstChild);
        }
    }
}
