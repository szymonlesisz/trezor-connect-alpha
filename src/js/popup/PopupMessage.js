export const POPUP_LOG: string = 'popup_log';
export const POPUP_HANDSHAKE: string = 'popup_handshake';
export const POPUP_REQUEST_PIN: string = 'popup_request_pin';
export const POPUP_RECEIVE_PIN: string = 'popup_receive_pin';
export const POPUP_REQUEST_PASS: string = 'popup_request_pass';
export const POPUP_RECEIVE_PASS: string = 'popup_receive_pass';

export default class PopupMessage {
    type: string;
    message: Object;

    constructor(type: string, message: Object = null) {
        this.type = type;
        this.message = message;
    }
}
