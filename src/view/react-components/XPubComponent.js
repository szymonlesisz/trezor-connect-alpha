import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ContainerComponent from './ContainerComponent';

class XPubComponent extends React.Component {

    constructor(props) {
        super(props);
    }

    keyboardHandler(event){
        event.preventDefault();
        switch(event.keyCode){
            // action
            case 8 :
                // backspace
                this.cancel();
                break;
            case 13 :
                // enter,
                this.submit();
                break;
        }
    }

    componentDidMount(){
        // PopupWindow has different "window" object than PopupLayer
        // that's why we need to access it thru DOM Element - React container
        let doc = ReactDOM.findDOMNode(this).ownerDocument;
        let win = doc.defaultView || doc.parentWindow;

        this.keyboardHandler = this.keyboardHandler.bind(this);
        win.addEventListener('keydown', this.keyboardHandler);
    }

    componentWillUnmount() {
        let doc = ReactDOM.findDOMNode(this).ownerDocument;
        let win = doc.defaultView || doc.parentWindow;
        win.removeEventListener('keydown', this.keyboardHandler);
    }

    submit() {
        // TODO show loader in ui
        this.props.showLoader();
        this.props.callback(true);
    }

    cancel() {
        this.props.callback(false);
    }

    render() {

        return (
            <ContainerComponent {...this.props}>
                <p className="alert_heading">
                    Export public key for<br/>
                    <strong>{ this.props.xpubkey }</strong>?
                </p>
                <div>
                    <button type="button" onClick={ () => { this.submit(); } }>
                        Export
                    </button>
                    <button type="button" onClick={ () => { this.cancel(); } }>
                        Cancel
                    </button>
                </div>
            </ContainerComponent>
        );
    }
}

export default XPubComponent;
