// @flow
import AbstractContainer from './AbstractContainer';

export default class Modal extends AbstractContainer {

    constructor(channel: ConnectChannel){
        super(channel);
    }

    async open(args: Object): Promise<any> {

        // TODO: check if div exists, if not create it as a last body child

        // render React UI into <div id="trezor-connect" /> element
        this.renderer.setContainer( document.getElementById('trezor-connect') );
        this.renderer.open(args);

        return await super.open(args).then(response => {
            this.renderer.close();
            return response;
        });
    }


}
