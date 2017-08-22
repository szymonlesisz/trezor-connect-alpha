// errors from Trezor.js
export const NO_TRANSPORT = new Error("No transport");          // from DeviceManager
export const DEVICE_NOT_CONNECTED = new Error("No device connected");          // from DeviceList
export const DEVICE_NOT_INITIALIZED = new Error("Device is not initialized");  // from DeviceManager
export const DEVICE_IN_BOOTLOADER = new Error("Device is in bootloader mode"); // from DeviceManager
export const DEVICE_OLD_FIRMWARE = new Error("Firmware is old");               // from DeviceManager

// errors from trezor-link
export const FAILURE_INVALID_PIN: String = "Failure_PinInvalid";
