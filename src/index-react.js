import React, {Component, PropTypes} from 'react';
import ConnectChannelBrowser from './connect/ConnectChannelBrowser';
import { SHOW_ALERT, REQUEST_PIN } from './connect/ConnectChannel';
import ConnectUI from './view/ConnectUI';

export default class TrezorConnect extends Component {

    channel: ConnectChannelBrowser;
    ui: ConnectUI;

    constructor(props) {
        super(props);
        this.channel = new ConnectChannelBrowser();
        this.channel.on(SHOW_ALERT, this.showAlert.bind(this));
        this.channel.on(REQUEST_PIN, this.requestPin.bind(this));

        this.ui = new ConnectUI(null);
    }

    componentDidMount() {
        this.ui.setContainer( ReactDOM.findDOMNode(this) );
    }

    showAlert(type){
        this.ui.showConfirmPromt();
    }

    requestPin(callback){
        this.ui.showPin(callback);
    }

    // Public methods exposed to parent thru refference

    async requestLogin(args: Object) {
        // TODO: open in new window if this.props.container === 'popup'
        this.ui.open();
        return await this.channel.requestLogin(args)
            .then(response => {
                this.ui.close();
                return response;
            });
    }

    async accountInfo() {
        return null;
    }


    render() {
        return (
            <div id="trezor-connect"></div>
        )
    }
}

module.exports = TrezorConnect;
