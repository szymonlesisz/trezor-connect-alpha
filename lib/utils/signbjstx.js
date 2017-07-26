'use strict';

exports.__esModule = true;
exports.signBjsTx = signBjsTx;

var _bitcoinjsLibZcash = require('bitcoinjs-lib-zcash');

var bitcoin = _interopRequireWildcard(_bitcoinjsLibZcash);

var _trezorTypes = require('../device/trezorTypes');

var trezor = _interopRequireWildcard(_trezorTypes);

var _hdnode = require('./hdnode');

var hdnodeUtils = _interopRequireWildcard(_hdnode);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function input2trezor(input) {
    var hash = input.hash,
        index = input.index,
        path = input.path,
        amount = input.amount;

    return {
        prev_index: index,
        prev_hash: reverseBuffer(hash).toString('hex'),
        address_n: path,
        script_type: input.segwit ? 'SPENDP2SHWITNESS' : 'SPENDADDRESS',
        amount: amount
    };
}

function _flow_makeArray(a) {
    if (!Array.isArray(a)) {
        throw new Error('Both address and path of an output cannot be null.');
    }
    var res = [];
    a.forEach(function (k) {
        if (typeof k === 'number') {
            res.push(k);
        }
    });
    return res;
}

function output2trezor(output, network) {
    if (output.address == null) {
        if (!output.path) {
            throw new Error('Both address and path of an output cannot be null.');
        }

        var pathArr = _flow_makeArray(output.path);

        return {
            address_n: pathArr,
            amount: output.value,
            script_type: output.segwit ? 'PAYTOP2SHWITNESS' : 'PAYTOADDRESS'
        };
    }
    var address = output.address;
    if (typeof address !== 'string') {
        throw new Error('Wrong type.');
    }
    var scriptType = getAddressScriptType(address, network);

    return {
        address: address,
        amount: output.value,
        script_type: scriptType
    };
}

function signedTx2bjsTx(signedTx) {
    var res = bitcoin.Transaction.fromHex(signedTx.message.serialized.serialized_tx);
    return res;
}

function bjsTx2refTx(tx) {
    var data = getJoinSplitData(tx);
    var dataStr = data == null ? null : data.toString('hex');
    return {
        lock_time: tx.locktime,
        version: tx.version,
        hash: tx.getId(),
        inputs: tx.ins.map(function (input) {
            return {
                prev_index: input.index,
                sequence: input.sequence,
                prev_hash: reverseBuffer(input.hash).toString('hex'),
                script_sig: input.script.toString('hex')
            };
        }),
        bin_outputs: tx.outs.map(function (output) {
            return {
                amount: output.value,
                script_pubkey: output.script.toString('hex')
            };
        }),
        extra_data: dataStr
    };
}

function _flow_getPathOrAddress(output) {
    if (output.path) {
        var _path = output.path;
        return _flow_makeArray(_path);
    }
    if (typeof output.address === 'string') {
        return output.address;
    }
    throw new Error('Wrong output type.');
}

function _flow_getSegwit(output) {
    if (output.segwit) {
        return true;
    }
    return false;
}

function deriveWitnessOutput(pkh) {
    // see https://github.com/bitcoin/bips/blob/master/bip-0049.mediawiki
    // address derivation + test vectors
    var scriptSig = new Buffer(pkh.length + 2);
    scriptSig[0] = 0;
    scriptSig[1] = 0x14;
    pkh.copy(scriptSig, 2);
    var addressBytes = bitcoin.crypto.hash160(scriptSig);
    var scriptPubKey = new Buffer(23);
    scriptPubKey[0] = 0xa9;
    scriptPubKey[1] = 0x14;
    scriptPubKey[22] = 0x87;
    addressBytes.copy(scriptPubKey, 2);
    return scriptPubKey;
}

function deriveOutputScript(pathOrAddress, nodes, network, segwit) {
    var scriptType = typeof pathOrAddress === 'string' ? getAddressScriptType(pathOrAddress, network) : segwit ? 'PAYTOP2SHWITNESS' : 'PAYTOADDRESS';

    var pkh = typeof pathOrAddress === 'string' ? bitcoin.address.fromBase58Check(pathOrAddress).hash : hdnodeUtils.derivePubKeyHash(nodes, pathOrAddress[pathOrAddress.length - 2], pathOrAddress[pathOrAddress.length - 1]);

    if (scriptType === 'PAYTOADDRESS') {
        return bitcoin.script.pubKeyHash.output.encode(pkh);
    }

    if (scriptType === 'PAYTOSCRIPTHASH') {
        return bitcoin.script.scriptHash.output.encode(pkh);
    }

    if (scriptType === 'PAYTOP2SHWITNESS') {
        return deriveWitnessOutput(pkh);
    }

    throw new Error('Unknown script type ' + scriptType);
}

function verifyBjsTx(inputs, outputs, nodes, resTx, network) {
    if (inputs.length !== resTx.ins.length) {
        throw new Error('Signed transaction has wrong length.');
    }
    if (outputs.length !== resTx.outs.length) {
        throw new Error('Signed transaction has wrong length.');
    }

    outputs.map(function (output, i) {
        if (output.value !== resTx.outs[i].value) {
            throw new Error('Signed transaction has wrong output value.');
        }
        if (output.address == null && output.path == null) {
            throw new Error('Both path and address cannot be null.');
        }

        var addressOrPath = _flow_getPathOrAddress(output);
        var segwit = _flow_getSegwit(output);
        var scriptA = deriveOutputScript(addressOrPath, nodes, network, segwit);
        var scriptB = resTx.outs[i].script;
        if (scriptA.compare(scriptB) !== 0) {
            throw new Error('Scripts differ');
        }
    });
}

function getAddressScriptType(address, network) {
    var decoded = bitcoin.address.fromBase58Check(address);
    if (decoded.version === network.pubKeyHash) {
        return 'PAYTOADDRESS';
    }
    if (decoded.version === network.scriptHash) {
        return 'PAYTOSCRIPTHASH';
    }
    throw new Error('Unknown address type.');
}

function getJoinSplitData(transaction) {
    if (transaction.version < 2) {
        return null;
    }
    var buffer = transaction.toBuffer();
    var joinsplitByteLength = transaction.joinsplitByteLength();
    var res = buffer.slice(buffer.length - joinsplitByteLength);
    return res;
}

function signBjsTx(session, info, refTxs, nodes, coinName, network_) {
    var network = network_ == null ? bitcoin.networks[coinName.toLowerCase()] : network_;
    if (network == null) {
        return Promise.reject(new Error('No network ' + coinName));
    }

    var trezorInputs = info.inputs.map(function (i) {
        return input2trezor(i);
    });
    var trezorOutputs = info.outputs.map(function (o) {
        return output2trezor(o, network);
    });
    var trezorRefTxs = refTxs.map(function (tx) {
        return bjsTx2refTx(tx);
    });

    return session.signTx(trezorInputs, trezorOutputs, trezorRefTxs, coinName).then(function (tx) {
        return signedTx2bjsTx(tx);
    }).then(function (res) {
        verifyBjsTx(info.inputs, info.outputs, nodes, res, network);
        return res;
    });
}

function reverseBuffer(buf) {
    var copy = new Buffer(buf.length);
    buf.copy(copy);
    [].reverse.call(copy);
    return copy;
}