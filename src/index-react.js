import React, {Component, PropTypes} from 'react';
import ConnectChannel, { SHOW_ALERT, REQUEST_PIN } from './connect/ConnectChannel';
import ConnectUI from './view/ConnectUI';

export default class TrezorConnect extends Component {

    channel: ConnectChannel;
    ui: ConnectUI;

    constructor(props) {
        super(props);
        console.log("TrezorConnect init", props)

        this.channel = new ConnectChannel();
        this.channel.on(SHOW_ALERT, this.showAlert.bind(this));
        this.channel.on(REQUEST_PIN, this.requestPin.bind(this));

        this.ui = new ConnectUI(null);
    }

    componentWillReceiveProps(nextProps) {
        console.log("TrezorConnect Will receive props!", nextProps);
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

    async requestLogin() {
        // TODO: open in nwe window if this.props.container === 'popup'
        this.ui.open();
        return await this.channel.requestLogin()
            .then(response => {
                //if(response === undefined){
                    this.ui.close();
                //}
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
