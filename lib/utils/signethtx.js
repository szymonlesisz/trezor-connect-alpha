'use strict';

exports.__esModule = true;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.signEthTx = signEthTx;

var _trezorTypes = require('../device/trezorTypes');

var trezor = _interopRequireWildcard(_trezorTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function splitString(str, len) {
    if (str == null) {
        return ['', ''];
    }
    var first = str.slice(0, len);
    var second = str.slice(len);
    return [first, second];
}

function processTxRequest(session, request, data) {
    if (!request.data_length) {
        var _v = request.signature_v;
        var _r = request.signature_r;
        var _s = request.signature_s;
        if (_v == null || _r == null || _s == null) {
            throw new Error('Unexpected request.');
        }

        return Promise.resolve({
            v: _v, r: _r, s: _s
        });
    }

    var _splitString = splitString(data, request.data_length * 2),
        first = _splitString[0],
        rest = _splitString[1];

    return session.typedCall('EthereumTxAck', 'EthereumTxRequest', { data_chunk: first }).then(function (response) {
        return processTxRequest(session, response.message, rest);
    });
}

function stripLeadingZeroes(str) {
    while (/^00/.test(str)) {
        str = str.slice(2);
    }
    return str;
}

function signEthTx(session, address_n, nonce, gas_price, gas_limit, to, value, data, chain_id) {
    var length = data == null ? 0 : data.length / 2;

    var _splitString2 = splitString(data, 1024 * 2),
        first = _splitString2[0],
        rest = _splitString2[1];

    var message = {
        address_n: address_n,
        nonce: stripLeadingZeroes(nonce),
        gas_price: stripLeadingZeroes(gas_price),
        gas_limit: stripLeadingZeroes(gas_limit),
        to: to,
        value: stripLeadingZeroes(value)
    };

    if (length !== 0) {
        message = (0, _extends3.default)({}, message, {
            data_length: length,
            data_initial_chunk: first
        });
    }

    if (chain_id != null) {
        message = (0, _extends3.default)({}, message, {
            chain_id: chain_id
        });
    }

    return session.typedCall('EthereumSignTx', 'EthereumTxRequest', message).then(function (res) {
        return processTxRequest(session, res.message, rest);
    });
}