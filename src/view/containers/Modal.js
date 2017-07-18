import AbstractContainer from './AbstractContainer';
import ViewRenderer from '../ViewRenderer';


export default class PopupModal extends AbstractContainer {

    args: Object;
    renderer: ViewRenderer;

    constructor(args){
        super();
        this.args = args;
        this.renderer = new ViewRenderer(document.getElementById('trezor-connect'));
    }

    async open(args: Object): Promise<any> {

        // TODO: check if div exists, if not create it as a last body child

        // render React UI into <div id="trezor-connect" /> element
        this.renderer.open(args);

        return await super.open(args).then(response => {
            this.renderer.close();
            return response;
        });
    }

    showAlert(type: string): void {
        this.renderer.showConfirmPromt(type);
    }

    showOperation(type: string): void {
        this.renderer.showOperation(type);
    }

    requestConfirm(data: Object): void {
        this.renderer.requestConfirm(data);
    }

    requestPin(callback: Function): void {
        this.renderer.requestPin(callback);
    }
}
