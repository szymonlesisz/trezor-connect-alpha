'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.signTx = signTx;

var _trezorTypes = require('../device/trezorTypes');

var trezor = _interopRequireWildcard(_trezorTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function indexTxsForSign(txs) {
    var index = {};
    txs.forEach(function (tx) {
        index[tx.hash.toLowerCase()] = tx;
    });
    return index;
}

// requests information about a transaction
// can be either signed transaction iteslf of prev transaction
function requestTxInfo(m, index, inputs, outputs) {
    var md = m.details;
    var hash = md.tx_hash;
    if (hash) {
        var reqTx = index[hash.toLowerCase()];
        if (!reqTx) {
            throw new Error('Requested unknown tx: ' + hash);
        }
        return requestPrevTxInfo(reqTx, m.request_type, md.request_index, md.extra_data_len, md.extra_data_offset);
    } else {
        return requestSignedTxInfo(inputs, outputs, m.request_type, md.request_index);
    }
}

function requestPrevTxInfo(reqTx, requestType, requestIndex, dataLen, dataOffset) {
    var i = +requestIndex;
    if (requestType === 'TXINPUT') {
        return { inputs: [reqTx.inputs[i]] };
    }
    if (requestType === 'TXOUTPUT') {
        return { bin_outputs: [reqTx.bin_outputs[i]] };
    }
    if (requestType === 'TXEXTRADATA') {
        if (dataLen == null) {
            throw new Error('Missing extra_data_len');
        }
        var dataLenN = +dataLen;

        if (dataOffset == null) {
            throw new Error('Missing extra_data_offset');
        }
        var dataOffsetN = +dataOffset;

        if (reqTx.extra_data == null) {
            throw new Error('No extra data for transaction ' + reqTx.hash);
        }

        var data = reqTx.extra_data;
        var substring = data.substring(dataOffsetN * 2, (dataOffsetN + dataLenN) * 2);
        return { extra_data: substring };
    }
    if (requestType === 'TXMETA') {
        var outputCount = reqTx.bin_outputs.length;
        var _data = reqTx.extra_data;
        if (_data != null && _data.length !== 0) {
            var data_ = _data;
            return {
                version: reqTx.version,
                lock_time: reqTx.lock_time,
                inputs_cnt: reqTx.inputs.length,
                outputs_cnt: outputCount,
                extra_data_len: data_.length / 2
            };
        } else {
            return {
                version: reqTx.version,
                lock_time: reqTx.lock_time,
                inputs_cnt: reqTx.inputs.length,
                outputs_cnt: outputCount
            };
        }
    }
    throw new Error('Unknown request type: ' + requestType);
}

function requestSignedTxInfo(inputs, outputs, requestType, requestIndex) {
    var i = +requestIndex;
    if (requestType === 'TXINPUT') {
        return { inputs: [inputs[i]] };
    }
    if (requestType === 'TXOUTPUT') {
        return { outputs: [outputs[i]] };
    }
    if (requestType === 'TXMETA') {
        throw new Error('Cannot read TXMETA from signed transaction');
    }
    if (requestType === 'TXEXTRADATA') {
        throw new Error('Cannot read TXEXTRADATA from signed transaction');
    }
    throw new Error('Unknown request type: ' + requestType);
}

function saveTxSignatures(ms, serializedTx, signatures) {
    if (ms) {
        var _signatureIndex = ms.signature_index;
        var _signature = ms.signature;
        var _serializedTx = ms.serialized_tx;
        if (_serializedTx != null) {
            serializedTx.serialized += _serializedTx;
        }
        if (_signatureIndex != null) {
            if (_signature == null) {
                throw new Error('Unexpected null in trezor.TxRequestSerialized signature.');
            }
            signatures[_signatureIndex] = _signature;
        }
    }
}

function processTxRequest(session, m, serializedTx, signatures, index, ins, outs) {
    saveTxSignatures(m.serialized, serializedTx, signatures);

    if (m.request_type === 'TXFINISHED') {
        return Promise.resolve({
            message: {
                serialized: {
                    signatures: signatures,
                    serialized_tx: serializedTx.serialized
                }
            },
            type: 'trezor.SignedTx'
        });
    }

    var resTx = requestTxInfo(m, index, ins, outs);

    return session.typedCall('TxAck', 'TxRequest', { tx: resTx }).then(function (response) {
        return processTxRequest(session, response.message, serializedTx, signatures, index, ins, outs);
    });
}

function signTx(session, inputs, outputs, txs, coin) {
    var index = indexTxsForSign(txs);
    var signatures = [];
    var serializedTx = { serialized: '' };

    var coinName = typeof coin === 'string' ? coin : coin.coin_name;
    var coinNameCapitalized = coinName.charAt(0).toUpperCase() + coinName.slice(1);

    return session.typedCall('SignTx', 'TxRequest', {
        inputs_count: inputs.length,
        outputs_count: outputs.length,
        coin_name: coinNameCapitalized
    }).then(function (res) {
        return processTxRequest(session, res.message, serializedTx, signatures, index, inputs, outputs);
    });
}