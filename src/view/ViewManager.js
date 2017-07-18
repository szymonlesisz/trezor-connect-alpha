// @flow
import Popup from './containers/Popup';
import Modal from './containers/Modal';

export default class ViewManager {


    static async call(args: Object): Promise<Object> {

        const { container } = args;

        let p = container === 'popup' ? new Popup() : new Modal();

        return await p.open(args);
    }
};
