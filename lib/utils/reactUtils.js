'use strict';

// react sometimes adds some other parameters that should not be there

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (obj, firmware) {
    if (typeof firmware === 'string') {
        obj.requiredFirmware = firmware;
    }
    return obj;
};