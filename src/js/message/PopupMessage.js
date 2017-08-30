export const POPUP_LOG: string = 'popup_log';
export const POPUP_HANDSHAKE: string = 'popup_handshake';
export const POPUP_CLOSE: string = 'popup_close';
export const POPUP_CLOSED: string = 'popup_closed';
export const POPUP_REQUEST_PIN: string = 'popup_request_pin';
export const POPUP_RECEIVE_PIN: string = 'popup_receive_pin';
export const POPUP_INVALID_PIN: string = 'popup_invalid_pin';
export const POPUP_REQUEST_PASSPHRASE: string = 'popup_request_passphrase';
export const POPUP_RECEIVE_PASSPHRASE: string = 'popup_receive_passphrase';
export const POPUP_CONNECT: string = 'popup_connect';

export default class PopupMessage {
    type: string;
    message: Object;

    constructor(type: string, message: Object = null) {
        this.type = type;
        this.message = message;
    }
}
