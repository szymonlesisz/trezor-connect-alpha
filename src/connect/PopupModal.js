import Popup from './Popup';
import ConnectUI from '../view/ConnectUI';


export default class PopupModal extends Popup {

    args: Object;
    ui: ConnectUI;

    constructor(args){
        super();
        this.args = args;
        this.ui = new ConnectUI(document.getElementById('trezor-connect'));
    }

    async open(args: Object): Promise<any> {

        // render React UI into <div id="trezor-connect" /> element
        this.ui.open();

        return await super.open(args).then(response => {
            this.ui.close();
            return response;
        });
    }

    showAlert(type): void {
        console.log("SHOW ALERT id", type);
        this.ui.showConfirmPromt();
    }

    requestPin(callback): void {
        this.ui.showPin(callback);
    }
}
