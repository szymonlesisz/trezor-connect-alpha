
import type {Transport, TrezorDeviceInfoWithSession as DeviceDescriptor} from 'trezor-link';

const initialState = {
    transport: null,
	listening: 0,
	current: null
};

export default function Score (state = initialState, action) {
    switch (action.type) {
        case SCORE_CURRENT_UPDATE:
            return Object.assign({}, state, {
                current: state.current + action.current
            });
        default:
            return state
    }
}
