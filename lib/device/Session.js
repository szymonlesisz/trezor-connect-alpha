'use strict';

exports.__esModule = true;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

exports.coinName = coinName;
exports.coinNetwork = coinNetwork;

var _EventEmitter2 = require('../events/EventEmitter');

var _EventEmitter3 = _interopRequireDefault(_EventEmitter2);

var _FlowEvents = require('../events/FlowEvents');

var _bitcoinjsLibZcash = require('bitcoinjs-lib-zcash');

var bitcoin = _interopRequireWildcard(_bitcoinjsLibZcash);

var _hdnode = require('../utils/hdnode');

var hdnodeUtils = _interopRequireWildcard(_hdnode);

var _signtx = require('../utils/signtx');

var signTxHelper = _interopRequireWildcard(_signtx);

var _signbjstx = require('../utils/signbjstx');

var signBjsTxHelper = _interopRequireWildcard(_signbjstx);

var _signethtx = require('../utils/signethtx');

var signEthTxHelper = _interopRequireWildcard(_signethtx);

var _CallHelper = require('../utils/CallHelper');

var _trezorTypes = require('./trezorTypes');

var trezor = _interopRequireWildcard(_trezorTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//
// Trezor device session handle. Acts as a event emitter.
//
// Events:
//
//  send: type, message
//  receive: type, message
//  error: error
//
//  button: code
//  pin: type, callback(error, pin)
//  word: callback(error, word)
//  passphrase: callback(error, passphrase)
//
var Session = function (_EventEmitter) {
    (0, _inherits3.default)(Session, _EventEmitter);

    function Session(transport, sessionId, descriptor, debug) {
        (0, _classCallCheck3.default)(this, Session);

        var _this = (0, _possibleConstructorReturn3.default)(this, _EventEmitter.call(this));

        _this.sendEvent = new _FlowEvents.Event2('send', _this);
        _this.receiveEvent = new _FlowEvents.Event2('receive', _this);
        _this.errorEvent = new _FlowEvents.Event1('error', _this);
        _this.buttonEvent = new _FlowEvents.Event1('button', _this);
        _this.pinEvent = new _FlowEvents.Event2('pin', _this);
        _this.passphraseEvent = new _FlowEvents.Event1('passphrase', _this);
        _this.wordEvent = new _FlowEvents.Event1('word', _this);

        _this._transport = transport;
        _this._sessionId = sessionId;
        _this._descriptor = descriptor;
        _this.callHelper = new _CallHelper.CallHelper(transport, sessionId, _this);
        _this.debug = debug;
        return _this;
    }

    Session.prototype.deactivateEvents = function deactivateEvents() {
        var events = [this.sendEvent, this.receiveEvent, this.errorEvent, this.buttonEvent, this.pinEvent, this.passphraseEvent, this.wordEvent];
        events.forEach(function (ev) {
            return ev.removeAllListeners();
        });
    };

    Session.prototype.getId = function getId() {
        return this._sessionId;
    };

    Session.prototype.getPath = function getPath() {
        return this._descriptor.path;
    };

    Session.prototype.isDescriptor = function isDescriptor(descriptor) {
        return this._descriptor.path === descriptor.path;
    };

    Session.prototype.release = function release() {
        if (this.debug) {
            console.log('[trezor.js] [session] releasing');
        }
        return this._transport.release(this._sessionId);
    };

    Session.prototype.initialize = function initialize() {
        return this.typedCall('Initialize', 'Features');
    };

    Session.prototype.getFeatures = function getFeatures() {
        return this.typedCall('GetFeatures', 'Features');
    };

    Session.prototype.getEntropy = function getEntropy(size) {
        return this.typedCall('GetEntropy', 'Entropy', {
            size: size
        });
    };

    Session.prototype.getAddress = function getAddress(address_n, coin, show_display, segwit) {
        var coin_name = coinName(coin);
        return this.typedCall('GetAddress', 'Address', {
            address_n: address_n,
            coin_name: coin_name,
            show_display: !!show_display,
            script_type: segwit ? 'SPENDP2SHWITNESS' : 'SPENDADDRESS'
        }).then(function (res) {
            res.message.path = address_n || [];
            return res;
        });
    };

    Session.prototype.ethereumGetAddress = function ethereumGetAddress(address_n, show_display) {
        return this.typedCall('EthereumGetAddress', 'EthereumAddress', {
            address_n: address_n,
            show_display: !!show_display
        }).then(function (res) {
            res.message.path = address_n || [];
            return res;
        });
    };

    Session.prototype.getPublicKey = function getPublicKey(address_n, coin) {
        var coin_name = coin ? coinName(coin) : 'Bitcoin';
        return this.typedCall('GetPublicKey', 'PublicKey', {
            address_n: address_n,
            coin_name: coin_name
        }).then(function (res) {
            res.message.node.path = address_n || [];
            return res;
        });
    };

    Session.prototype.wipeDevice = function wipeDevice() {
        return this.typedCall('WipeDevice', 'Success');
    };

    Session.prototype.resetDevice = function resetDevice(settings) {
        return this.typedCall('ResetDevice', 'Success', settings);
    };

    Session.prototype.loadDevice = function loadDevice(settings, network) {
        var convertedNetwork = network == null ? null : coinNetwork(network);
        return this.typedCall('LoadDevice', 'Success', wrapLoadDevice(settings, convertedNetwork));
    };

    Session.prototype.recoverDevice = function recoverDevice(settings) {
        return this.typedCall('RecoveryDevice', 'Success', (0, _extends3.default)({}, settings, {
            enforce_wordlist: true
        }));
    };

    Session.prototype.applySettings = function applySettings(settings) {
        return this.typedCall('ApplySettings', 'Success', settings);
    };

    Session.prototype.clearSession = function clearSession(settings) {
        return this.typedCall('ClearSession', 'Success', settings);
    };

    Session.prototype.changePin = function changePin(remove) {
        return this.typedCall('ChangePin', 'Success', {
            remove: remove || false
        });
    };

    Session.prototype.eraseFirmware = function eraseFirmware() {
        return this.typedCall('FirmwareErase', 'Success');
    };

    // payload is in hexa


    Session.prototype.uploadFirmware = function uploadFirmware(payload) {
        return this.typedCall('FirmwareUpload', 'Success', {
            payload: payload
        });
    };

    Session.prototype.updateFirmware = function updateFirmware(payload) {
        var _this2 = this;

        return this.eraseFirmware().then(function () {
            return _this2.uploadFirmware(payload);
        });
    };

    // failure to verify rejects returned promise


    Session.prototype.verifyMessage = function verifyMessage(address, signature, message, coin) {
        return this.typedCall('VerifyMessage', 'Success', {
            address: address,
            signature: signature,
            message: message,
            coin_name: coinName(coin)
        });
    };

    Session.prototype.signMessage = function signMessage(address_n, message, coin) {
        return this.typedCall('SignMessage', 'MessageSignature', {
            address_n: address_n,
            message: message,
            coin_name: coinName(coin)
        });
    };

    Session.prototype.signIdentity = function signIdentity(identity, challenge_hidden, challenge_visual) {
        return this.typedCall('SignIdentity', 'SignedIdentity', {
            identity: identity,
            challenge_hidden: challenge_hidden,
            challenge_visual: challenge_visual
        });
    };

    Session.prototype.cipherKeyValue = function cipherKeyValue(address_n, key, value, encrypt, ask_on_encrypt, ask_on_decrypt, iv // in hexadecimal
    ) {
        var valueString = value.toString('hex');
        var ivString = iv == null ? null : iv.toString('hex');

        return this.typedCall('CipherKeyValue', 'CipheredKeyValue', {
            address_n: address_n,
            key: key,
            value: valueString,
            encrypt: encrypt,
            ask_on_encrypt: ask_on_encrypt,
            ask_on_decrypt: ask_on_decrypt,
            iv: ivString
        });
    };

    Session.prototype.cipherKeyValueBuffer = function cipherKeyValueBuffer(address_n, key, value, encrypt, ask_on_encrypt, ask_on_decrypt, iv // in hexadecimal
    ) {
        return this.cipherKeyValue(address_n, key, value, encrypt, ask_on_encrypt, ask_on_decrypt, iv).then(function (r) {
            var val = r.message.value;
            return new Buffer(val, 'hex');
        });
    };

    Session.prototype.measureTx = function measureTx(inputs, outputs, coin) {
        return this.typedCall('EstimateTxSize', 'TxSize', {
            inputs_count: inputs.length,
            outputs_count: outputs.length,
            coin_name: coinName(coin)
        });
    };

    Session.prototype.signTx = function signTx(inputs, outputs, txs, coin) {
        return signTxHelper.signTx(this, inputs, outputs, txs, coin);
    };

    Session.prototype.signBjsTx = function signBjsTx(info, refTxs, nodes, coinName, network) {
        return signBjsTxHelper.signBjsTx(this, info, refTxs, nodes, coinName, network);
    };

    Session.prototype.signEthTx = function signEthTx(address_n, nonce, gas_price, gas_limit, to, value, data, chain_id) {
        return signEthTxHelper.signEthTx(this, address_n, nonce, gas_price, gas_limit, to, value, data, chain_id);
    };

    Session.prototype.typedCall = function typedCall(type, resType) {
        var msg = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        return this.callHelper.typedCall(type, resType, msg);
    };

    Session.prototype.verifyAddress = function verifyAddress(path, address, coin, segwit) {
        var _this3 = this;

        return this.getAddress(path, coin, true, segwit).then(function (res) {
            var verified = res.message.address === address;

            if (!verified) {
                if (_this3.debug) {
                    console.warn('[trezor.js] [session] Address verification failed', {
                        path: path,
                        jsAddress: address,
                        trezorAddress: res.message.address
                    });
                }
            }

            return verified;
        });
    };

    Session.prototype.changeLabel = function changeLabel(label) {
        if (label.length > Session.LABEL_MAX_LENGTH) {
            label = label.slice(0, Session.LABEL_MAX_LENGTH);
        }

        return this.applySettings({
            label: label
        });
    };

    Session.prototype.togglePassphrase = function togglePassphrase(enable) {
        return this.applySettings({
            use_passphrase: enable
        });
    };

    Session.prototype.changeHomescreen = function changeHomescreen(hex) {
        return this.applySettings({
            homescreen: hex
        });
    };

    Session.prototype.getHDNode = function getHDNode(path, network) {
        return hdnodeUtils.getHDNode(this, path, coinNetwork(network));
    };

    Session.prototype.setU2FCounter = function setU2FCounter(counter) {
        return this.typedCall('SetU2FCounter', 'Success', {
            u2f_counter: counter
        });
    };

    return Session;
}(_EventEmitter3.default);

Session.LABEL_MAX_LENGTH = 16;
exports.default = Session;
function coinName(coin) {
    if (typeof coin === 'string') {
        return coin.charAt(0).toUpperCase() + coin.slice(1);
    } else {
        return coin.coin_name;
    }
}

function coinNetwork(coin) {
    var r = coin;
    if (typeof coin.messagePrefix === 'string') {
        return r;
    }

    var name = coinName(r).toLowerCase();
    var network = bitcoin.networks[name];
    if (network == null) {
        throw new Error('No network with the name ' + name + '.');
    }
    return network;
}

function wrapLoadDevice(settings, network_) {
    var network = network_ == null ? bitcoin.networks.bitcoin : network_;
    if (settings.node == null && settings.mnemonic == null) {
        if (settings.payload == null) {
            throw new Error('Payload, mnemonic or node necessary.');
        }
        try {
            // try to decode as xprv
            var bjsNode = bitcoin.HDNode.fromBase58(settings.payload, network);
            settings = (0, _extends3.default)({}, settings, { node: hdnodeUtils.bjsNode2privNode(bjsNode) });
        } catch (e) {
            // use as mnemonic
            settings = (0, _extends3.default)({}, settings, { mnemonic: settings.payload });
        }
        delete settings.payload;
    }
    return settings;
}