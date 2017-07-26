'use strict';

// react sometimes adds some other parameters that should not be there

exports.__esModule = true;

exports.default = function (obj, firmware) {
    if (typeof firmware === 'string') {
        obj.requiredFirmware = firmware;
    }
    return obj;
};