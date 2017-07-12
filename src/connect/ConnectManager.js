// @flow
import { EVENT_MESSAGE, EVENT_ERROR } from './Popup';
import PopupWindow from './PopupWindow';
import PopupModal from './PopupModal';


export default class ConnectManager {

    static _popup = null;

    static async send(args: Object): Promise<any> {

        const { container } = args;

        var p = container === 'popup' ? new PopupWindow() : new PopupModal();
        // p.on(EVENT_MESSAGE, m => { console.log("M EVENT!", m)} );
        // p.on(EVENT_ERROR, m => { console.log("M ERROR!", m)} );



        return await p.open(args);
    }
};
