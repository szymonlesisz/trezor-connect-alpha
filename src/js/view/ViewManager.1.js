// @flow
import Popup from './containers/Popup';
import Modal from './containers/Modal';

/**
 * Deprecated: wrapper class which decides what kind of UI will be used (Modal or Popup)
 */
export default class ViewManager {

    /**
     * Method call
     * Open proper container and pass arguments
     * @param {Object} args
     * @returns {Promise.<Object>}
     */
    static async call(args: Object): Promise<Object> {
        const { container } = args;
        let p = container === 'popup' ? new Popup() : new Modal();
        return await p.open(args);
    }
};
