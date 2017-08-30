export const IFRAME_HANDSHAKE: string = 'iframe_handshake';
export const IFRAME_CLOSE_POPUP: string = 'iframe_close_popup';
export const IFRAME_CANCEL_POPUP_REQUEST: string = 'iframe_cancel_popup_request';
export const IFRAME_ERROR: string = 'iframe_error';
export const IFRAME_RESPONSE: string = 'iframe_response';

export default class IframeMessage {
    type: string;
    message: Object;

    constructor(type: string, message: Object = null) {
        this.type = type;
        this.message = message;
    }
}
