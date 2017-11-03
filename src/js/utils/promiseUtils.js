import root from 'window-or-global';
import Promise from 'es6-promise';

export async function resolveAfter(msec, value): Promise {
    return await new Promise((resolve) => {
        root.setTimeout(resolve, msec, value);
    });
}


// TODO: all errors and alerts should be stored in one file and translated

const SIGN_IDENTITY_CANCELLED = new Error('Sign identity cancelled');

export const NO_TRANSPORT = new Error('No trezor.js transport is available');
export const NO_CONNECTED_DEVICES = new Error('No connected devices');
export const DEVICE_IS_BOOTLOADER = new Error('Connected device is in bootloader mode');
export const DEVICE_IS_EMPTY = new Error('Connected device is not initialized');
export const FIRMWARE_IS_OLD = new Error('Firmware of connected device is too old');

export const ALERT_NO_TRASPORT = 'alert_no_trasport';
export const ALERT_NO_CONNECTED_DEVICES = 'alert_no_connected_device';
export const ALERT_DEVICE_IS_BOOTLOADER = 'alert_device_is_bootloader';
export const ALERT_DEVICE_IS_EMPTY = 'alert_device_is_empty';
export const ALERT_FIRMWARE_IS_OLD = 'alert_firmware_is_old';

export const errorHandler = (callback, emit) => {
    return error => {
        let never = new Promise(() => {});

        // console.log("ErrorHandler", error, error.code, error.message)
        console.log("ErrorHandler", callback, emit, error.code)

        // Errors generated by TREZOR ('Failure' messages)
        switch (error.code) {
            case 'Failure_PinInvalid' :
            //case 'Failure_PinCancelled' :
                return resolveAfter(2500).then(callback);
            case 'Failure_ActionCancelled' :
                return resolveAfter(300);

            case 'Failure_InvalidSignature' :
                return resolveAfter(300);
        }

        // Errors generated by trezor-link ???
        switch (error.message) {
            case 'Device released or disconnected':
                console.log("++++here dev disconnected!!!!")
                return resolveAfter(300);

            case 'Transfer failed.':
                console.log("++++here session stolen!!!!")
                return resolveAfter(300);
        }


        // Errors generated by Core
        switch (error) {
            case NO_TRANSPORT :
                callback(ALERT_NO_TRASPORT);
                return never;
            case NO_CONNECTED_DEVICES : // looping case
                emit(ALERT_NO_CONNECTED_DEVICES);
                return resolveAfter(500).then(callback);
            case DEVICE_IS_BOOTLOADER :
                callback(ALERT_DEVICE_IS_BOOTLOADER);
                return never;
            case DEVICE_IS_EMPTY :
                callback(ALERT_DEVICE_IS_EMPTY);
                return never;
            case FIRMWARE_IS_OLD :
                callback(ALERT_FIRMWARE_IS_OLD);
                return never;

            // handle unrecognized error
            // - Transfer failed.
            // - Device released or disconnected
            default :
                console.error("Error handler: unrecognized error", error.code, error);
                return never;
        }



        // switch (error) { // application errors

        //     case SIGN_IDENTITY_CANCELLED:
        //         console.log("O TUU!")
        //         return never;

        //     case NO_TRANSPORT:
        //         showAlert('#alert_transport_missing');
        //         return never;

        //     case DEVICE_IS_EMPTY:
        //         showAlert('#alert_device_empty');
        //         return never;

        //     case FIRMWARE_IS_OLD:
        //         showAlert('#alert_firmware_old');
        //         return never;

        //     case NO_CONNECTED_DEVICES:
        //         showAlert('#alert_connect');
        //         return resolveAfter(500).then(retry);

        //     case DEVICE_IS_BOOTLOADER:
        //         showAlert('#alert_reconnect');
        //         return resolveAfter(500).then(retry);

        //     case INSUFFICIENT_FUNDS:
        //         showAlert('#alert_insufficient_funds');
        //         return resolveAfter(2500).then(retry);
        // }





        throw error;
    }
}
