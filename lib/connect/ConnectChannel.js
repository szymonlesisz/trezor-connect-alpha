'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.REQUEST_PASSPHRASE = exports.REQUEST_PIN = exports.REQUEST_CONFIRM = exports.UPDATE_VIEW = exports.SHOW_OPERATION = exports.SHOW_COMPONENT = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _EventEmitter2 = require('../events/EventEmitter');

var _EventEmitter3 = _interopRequireDefault(_EventEmitter2);

var _windowOrGlobal = require('window-or-global');

var _windowOrGlobal2 = _interopRequireDefault(_windowOrGlobal);

var _pathUtils = require('../utils/pathUtils');

var _configSigned = require('../utils/configSigned');

var _configSigned2 = _interopRequireDefault(_configSigned);

var _ConnectedDevice = require('./ConnectedDevice');

var _ConnectedDevice2 = _interopRequireDefault(_ConnectedDevice);

var _Device = require('../device/Device');

var _Device2 = _interopRequireDefault(_Device);

var _DeviceList = require('../device/DeviceList');

var _DeviceList2 = _interopRequireDefault(_DeviceList);

var _AccountsList = require('./AccountsList');

var _AccountsList2 = _interopRequireDefault(_AccountsList);

var _promiseUtils = require('../utils/promiseUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
// why bluebird? https://github.com/petkaantonov/bluebird/tree/master/benchmark (4 times faster than es6-promise)
//import Promise from 'bluebird';


// TODO: Remove it from library

//import config from '../utils/configSignedNotValid';

var DEBUG = false;
// 1.3.0 introduced HDNodeType.xpub field
// 1.3.4 has version2 of SignIdentity algorithm
var REQUIRED_FIRMWARE = '1.3.4';

var SHOW_COMPONENT = exports.SHOW_COMPONENT = 'SHOW_COMPONENT';
var SHOW_OPERATION = exports.SHOW_OPERATION = 'SHOW_OPERATION';
var UPDATE_VIEW = exports.UPDATE_VIEW = 'UPDATE_VIEW';
var REQUEST_CONFIRM = exports.REQUEST_CONFIRM = 'REQUEST_CONFIRM';
var REQUEST_PIN = exports.REQUEST_PIN = 'REQUEST_PIN';
var REQUEST_PASSPHRASE = exports.REQUEST_PASSPHRASE = 'REQUEST_PASSPHRASE';

var ConnectChannel = function (_EventEmitter) {
    _inherits(ConnectChannel, _EventEmitter);

    function ConnectChannel() {
        _classCallCheck(this, ConnectChannel);

        return _possibleConstructorReturn(this, (ConnectChannel.__proto__ || Object.getPrototypeOf(ConnectChannel)).apply(this, arguments));
    }

    _createClass(ConnectChannel, [{
        key: 'getAccount',


        /**
         * Common method for ConnectChannelBrowser and ConnectChannelLite
         * return ./connect/Account or null
         * If result is null, then TrezorConnect will not have a access to Account methods (hd-wallet, Bitcore, WebWorkers or online requests)
         *
         * @param {any} node
         * @returns {any}
         */
        value: function getAccount(node) {
            return null;
        }

        /*###################################################
        # Public methods called from ViewManager or NodeJS
        ###################################################*/

        /**
         * Request for login signed by TREZOR
         *
         * @param {Object} args
         * @returns {Promise.<Object>}
         */

    }, {
        key: 'requestLogin',
        value: function () {
            var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(args) {
                var _this2 = this;

                var origin, identity;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:

                                this.emit(SHOW_OPERATION, 'operation_login');

                                origin = _windowOrGlobal2.default.location.origin.split(':');
                                identity = {
                                    proto: origin[0],
                                    host: origin[1].substring(2),
                                    port: ''
                                };

                                if (origin[2]) {
                                    identity.port = origin[2];
                                }

                                _context.next = 6;
                                return this.initDevice({ emptyPassphrase: true }).then(function signIdentity(device) {
                                    console.log("SIGN session", device.session);
                                    // TODO: simulation of error
                                    return device.session.signIdentity(identity, args.challengeHidden, args.challengeVisual).catch((0, _promiseUtils.errorHandler)(function () {
                                        return signIdentity(device);
                                    }));
                                }).then(function (result) {
                                    // success
                                    var message = result.message;
                                    var public_key = message.public_key,
                                        signature = message.signature;

                                    // TODO: Fix Error: The action was interrupted by another application. (trezor-link)

                                    return _this2.releaseDevice({
                                        success: true,
                                        publicKey: public_key.toLowerCase(),
                                        signature: signature.toLowerCase()
                                    });
                                }).catch(function (error) {
                                    return _this2.releaseDevice({
                                        success: false,
                                        message: error.message
                                    });
                                });

                            case 6:
                                return _context.abrupt('return', _context.sent);

                            case 7:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function requestLogin(_x) {
                return _ref.apply(this, arguments);
            }

            return requestLogin;
        }()

        /**
         * Request for message signed by TREZOR
         *
         * @param {Object} args
         * @returns {Promise.<Object>}
         */

    }, {
        key: 'signMessage',
        value: function () {
            var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(args) {
                var _this3 = this;

                var path, message, coin;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:

                                this.emit(SHOW_OPERATION, 'operation_signmsg');

                                // TODO: if description == null discover accounts then find all addresses for this account

                                path = (0, _pathUtils.getPathFromDescription)(args.description);
                                message = Buffer.from(args.message, 'utf8').toString('hex');
                                coin = args.coin || 'Bitcoin'; // TODO: should it be a param?

                                _context2.next = 6;
                                return this.initDevice().then(function signMessage(device) {
                                    return device.session.signMessage(path, message, coin).catch((0, _promiseUtils.errorHandler)(function () {
                                        return signMessage(device);
                                    }));
                                }).then(function (result) {
                                    var message = result.message;
                                    var address = message.address,
                                        signature = message.signature;

                                    var signBuff = Buffer.from(signature, 'hex');
                                    var baseSign = signBuff.toString('base64');

                                    return _this3.releaseDevice({
                                        success: true,
                                        address: address,
                                        signature: baseSign
                                    });
                                }).catch(function (error) {
                                    return _this3.releaseDevice({
                                        success: false,
                                        message: error.message
                                    });
                                });

                            case 6:
                                return _context2.abrupt('return', _context2.sent);

                            case 7:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function signMessage(_x2) {
                return _ref2.apply(this, arguments);
            }

            return signMessage;
        }()

        /**
         * Verify signed message
         *
         * @param {Object} args
         * @returns {Promise.<Object>}
         */

    }, {
        key: 'verifyMessage',
        value: function () {
            var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(args) {
                var _this4 = this;

                var message, signature, coin;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:

                                this.emit(SHOW_OPERATION, 'operation_verifyMessage');

                                message = Buffer.from(args.message, 'utf8').toString('hex');
                                signature = Buffer.from(args.signature, 'base64').toString('hex');
                                coin = args.coin || 'Bitcoin';
                                _context3.next = 6;
                                return this.initDevice().then(function verifyMessage(device) {
                                    return device.session.verifyMessage(args.address, signature, message, coin).catch((0, _promiseUtils.errorHandler)(function () {
                                        return verifyMessage(device);
                                    }));
                                }).then(function (result) {
                                    if (result === undefined || result.type !== 'Success') {
                                        throw new Error('Message not verified');
                                    }
                                    return _this4.releaseDevice({
                                        success: true
                                    });
                                }).catch(function (error) {
                                    return _this4.releaseDevice({
                                        success: false,
                                        message: error.message
                                    });
                                });

                            case 6:
                                return _context3.abrupt('return', _context3.sent);

                            case 7:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function verifyMessage(_x3) {
                return _ref3.apply(this, arguments);
            }

            return verifyMessage;
        }()

        /**
         * getCypherKeyValue
         *
         * @param {Object} args
         * @returns {Promise.<Object>}
         */

    }, {
        key: 'getCypherKeyValue',
        value: function () {
            var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(args) {
                var _this5 = this;

                var path;
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:

                                this.emit(SHOW_OPERATION, args.encrypt ? 'operation_cipherkeyvalue_encrypt' : 'operation_cipherkeyvalue_decrypt');

                                path = (0, _pathUtils.getHDPath)(args.path); // TODO parse from account id or xpub

                                _context4.next = 4;
                                return this.initDevice({ emptyPassphrase: true }).then(function cipherKeyValue(device) {
                                    // TODO: simulation of all possible errors
                                    return device.session.cipherKeyValue(path, args.key, args.value, args.encrypt, args.confirmEncrypt, args.confirmDecrypt).catch((0, _promiseUtils.errorHandler)(function () {
                                        return cipherKeyValue(device);
                                    }));
                                }).then(function (result) {
                                    return _this5.releaseDevice({
                                        success: true,
                                        value: result.message.value
                                    });
                                }).catch(function (error) {
                                    return _this5.releaseDevice({
                                        success: false,
                                        message: error.message
                                    });
                                });

                            case 4:
                                return _context4.abrupt('return', _context4.sent);

                            case 5:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function getCypherKeyValue(_x4) {
                return _ref4.apply(this, arguments);
            }

            return getCypherKeyValue;
        }()

        /**
         * Method
         *
         * @param {Object} description
         * @returns {Promise.<Object>}
         */

    }, {
        key: 'getXPubKey',
        value: function () {
            var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(args) {
                var _this6 = this;

                var path, accountListComplete;
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:

                                this.emit(SHOW_OPERATION, 'operation_getXPubKey');

                                path = (0, _pathUtils.getPathFromDescription)(args.description);
                                accountListComplete = true;

                                args.confirm = true;

                                _context5.next = 6;
                                return this.initDevice().then(function (device) {

                                    if (path !== null && path !== undefined) {
                                        if (args.confirm) {
                                            // wait for confirmation
                                            return new Promise(function (resolve, reject) {
                                                _this6.emit(REQUEST_CONFIRM, {
                                                    type: 'xpubKey',
                                                    xpubkey: path,
                                                    callback: function callback(submit) {
                                                        return resolve(submit);
                                                    }
                                                });
                                            });
                                        } else {
                                            // confirm immediately
                                            return Promise.resolve(true);
                                        }
                                    } else {
                                        accountListComplete = false;
                                        // wait for account selection
                                        return new Promise(function (resolve) {

                                            var listView = false;
                                            _AccountsList2.default.get(device, function (path, node) {
                                                if (!listView) {
                                                    _this6.emit(REQUEST_CONFIRM, {
                                                        type: 'xpubAccountList',
                                                        callback: function callback(submit) {
                                                            return resolve(submit);
                                                        }
                                                    });
                                                    listView = true;
                                                }
                                                // update labels
                                                _this6.emit(UPDATE_VIEW, (0, _pathUtils.xpubKeyLabel)(path));
                                            }).then(function (list) {
                                                // all accounts ready
                                                accountListComplete = true;
                                            }).catch(function (error) {
                                                console.log("jerror", error);
                                            });
                                        });
                                    }
                                }).then(function (submit) {
                                    // submit could be a boolean or number (index)
                                    if (typeof submit === 'boolean') {
                                        if (submit) {
                                            return _this6.device.session.getPublicKey(path);
                                        } else {
                                            // TODO: all errors should be stored in one place, not hardcoded
                                            throw Error('Not confirmed');
                                        }
                                    } else {
                                        path = (0, _pathUtils.getPathFromIndex)(submit);
                                        console.warn("SUBM", submit, path, accountListComplete);
                                        if (!accountListComplete) {
                                            // break get list operation
                                            _AccountsList2.default.interrupt = true;
                                        }
                                        //throw Error('Not confirmed');
                                        //return new Promise(resolve => {});
                                        return _this6.device.session.getPublicKey(path);
                                    }
                                }).then(function (result) {
                                    var _result$message = result.message,
                                        xpub = _result$message.xpub,
                                        node = _result$message.node;

                                    var serializedPath = (0, _pathUtils.getSerializedPath)(path);

                                    return _this6.releaseDevice({
                                        success: true,
                                        xpubkey: xpub,
                                        chainCode: node.chain_code,
                                        publicKey: node.public_key,
                                        path: path,
                                        serializedPath: serializedPath
                                    });
                                }).catch(function (error) {
                                    return _this6.releaseDevice({
                                        success: false,
                                        message: error.message
                                    });
                                });

                            case 6:
                                return _context5.abrupt('return', _context5.sent);

                            case 7:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function getXPubKey(_x5) {
                return _ref5.apply(this, arguments);
            }

            return getXPubKey;
        }()

        /**
         * Method
         *
         * @param {Object} description
         * @returns {Promise.<Object>}
         */

    }, {
        key: 'getAccountInfo',
        value: function () {
            var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(description) {
                var path;
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:

                                // id
                                path = (0, _pathUtils.getPathFromIndex)(0);

                                console.log("PATH!", path);

                                // xpub
                                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].reduce(function (prev, current) {
                                    console.log(prev, current);
                                    return prev.then(function (account) {
                                        console.log(current, account);
                                        return null;
                                    });
                                }, Promise.resolve(null));
                                // .then(account => {
                                //     console.log("ACC", account);
                                // })

                                _context6.next = 5;
                                return this.initDevice().then(function (device) {
                                    return device.getNode(path);
                                })
                                //.then(node => new Account(node, i, cryptoChannel, blockchain));
                                .then(function (node) {
                                    console.log("NODE!", node);

                                    return new Promise(function (resolve) {});
                                });

                            case 5:
                                return _context6.abrupt('return', _context6.sent);

                            case 6:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));

            function getAccountInfo(_x6) {
                return _ref6.apply(this, arguments);
            }

            return getAccountInfo;
        }()
    }, {
        key: 'getAccountById',
        value: function () {
            var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(device, id) {
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                _context7.next = 2;
                                return Account.fromDevice(device, id, createCryptoChannel(), createBlockchain()).then(function (node) {
                                    //console.log("GetAcc", device.getNode);
                                });

                            case 2:
                                return _context7.abrupt('return', _context7.sent);

                            case 3:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));

            function getAccountById(_x7, _x8) {
                return _ref7.apply(this, arguments);
            }

            return getAccountById;
        }()

        /*###################################################
        # Local methods to communicate with device
        ###################################################*/

    }, {
        key: 'initDevice',
        value: function () {
            var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8() {
                var _this7 = this;

                var _ref9 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                    emptyPassphrase = _ref9.emptyPassphrase;

                return regeneratorRuntime.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                _context8.next = 2;
                                return this.initTransport().then(function (list) {
                                    return (0, _promiseUtils.resolveAfter)(500, list);
                                }).then(function (list) {
                                    return _this7.waitForFirstDevice(list);
                                }).then(function (device) {
                                    _this7.device = device;

                                    device.session.on('button', _this7.onDeviceButtonHandler.bind(_this7));
                                    device.session.on('pin', _this7.onDevicePinHandler.bind(_this7));

                                    if (emptyPassphrase) {
                                        device.session.on('passphrase', function (callback) {
                                            console.log("TODO: handle empty pass!");
                                        });
                                    } else {
                                        device.session.on('passphrase', _this7.onDevicePassphraseHandler.bind(_this7));
                                    }

                                    return device;
                                })
                                // if error handler will catch not resolveable promise (such as NO_TRASPORT)
                                // will emit alert with screen id
                                .catch((0, _promiseUtils.errorHandler)(function (alert) {
                                    return _this7.emit(SHOW_COMPONENT, alert);
                                }));

                            case 2:
                                return _context8.abrupt('return', _context8.sent);

                            case 3:
                            case 'end':
                                return _context8.stop();
                        }
                    }
                }, _callee8, this);
            }));

            function initDevice() {
                return _ref8.apply(this, arguments);
            }

            return initDevice;
        }()

        // This promise could never be resolved

    }, {
        key: 'initTransport',
        value: function () {
            var _ref10 = _asyncToGenerator(regeneratorRuntime.mark(function _callee9() {
                var promise;
                return regeneratorRuntime.wrap(function _callee9$(_context9) {
                    while (1) {
                        switch (_context9.prev = _context9.next) {
                            case 0:
                                promise = new Promise(function (resolve, reject) {
                                    var list = new _DeviceList2.default({
                                        config: _configSigned2.default,
                                        debug: DEBUG
                                    });
                                    var onTransport = function onTransport() {
                                        list.removeListener('error', onError);
                                        list.removeListener('transport', onTransport);
                                        list.on('transport', function (a) {
                                            console.warn("ontransport", a);
                                        });
                                        resolve(list);
                                    };
                                    var onError = function onError() {
                                        list.removeListener('error', onError);
                                        list.removeListener('transport', onTransport);
                                        reject(_promiseUtils.NO_TRANSPORT);
                                    };
                                    list.on('error', onError);
                                    list.on('transport', onTransport);
                                });
                                _context9.prev = 1;
                                _context9.next = 4;
                                return promise;

                            case 4:
                                return _context9.abrupt('return', _context9.sent);

                            case 7:
                                _context9.prev = 7;
                                _context9.t0 = _context9['catch'](1);
                                throw _context9.t0;

                            case 10:
                            case 'end':
                                return _context9.stop();
                        }
                    }
                }, _callee9, this, [[1, 7]]);
            }));

            function initTransport() {
                return _ref10.apply(this, arguments);
            }

            return initTransport;
        }()

        // This promise can be looped (waiting for device)
        // or never resolved (bootloader, empty, old firmware)

    }, {
        key: 'waitForFirstDevice',
        value: function () {
            var _ref11 = _asyncToGenerator(regeneratorRuntime.mark(function _callee10(list) {
                var _this8 = this;

                var promise;
                return regeneratorRuntime.wrap(function _callee10$(_context10) {
                    while (1) {
                        switch (_context10.prev = _context10.next) {
                            case 0:
                                promise = new Promise(function (resolve, reject) {
                                    if (!list.hasDeviceOrUnacquiredDevice()) {
                                        reject(_promiseUtils.NO_CONNECTED_DEVICES);
                                    } else {
                                        list.acquireFirstDevice(true).then(function (_ref12) {
                                            var device = _ref12.device,
                                                session = _ref12.session;
                                            return new _ConnectedDevice2.default(session, device);
                                        }).then(function (device) {
                                            if (device.isBootloader()) {
                                                reject(_promiseUtils.DEVICE_IS_BOOTLOADER);
                                            } else if (!device.isInitialized()) {
                                                reject(_promiseUtils.DEVICE_IS_EMPTY);
                                            } else if (!device.atLeast(REQUIRED_FIRMWARE)) {
                                                reject(_promiseUtils.FIRMWARE_IS_OLD);
                                            } else {
                                                resolve(device);
                                            }
                                        });
                                    }
                                });
                                _context10.prev = 1;
                                _context10.next = 4;
                                return promise.catch((0, _promiseUtils.errorHandler)(function () {
                                    return _this8.waitForFirstDevice(list);
                                }, function (alert) {
                                    return _this8.emit(SHOW_COMPONENT, alert);
                                }));

                            case 4:
                                return _context10.abrupt('return', _context10.sent);

                            case 7:
                                _context10.prev = 7;
                                _context10.t0 = _context10['catch'](1);
                                throw _context10.t0;

                            case 10:
                            case 'end':
                                return _context10.stop();
                        }
                    }
                }, _callee10, this, [[1, 7]]);
            }));

            function waitForFirstDevice(_x10) {
                return _ref11.apply(this, arguments);
            }

            return waitForFirstDevice;
        }()
    }, {
        key: 'releaseDevice',
        value: function () {
            var _ref13 = _asyncToGenerator(regeneratorRuntime.mark(function _callee11(response) {
                return regeneratorRuntime.wrap(function _callee11$(_context11) {
                    while (1) {
                        switch (_context11.prev = _context11.next) {
                            case 0:
                                if (this.device) {
                                    _context11.next = 2;
                                    break;
                                }

                                return _context11.abrupt('return', response);

                            case 2:

                                this.device.session.removeListener('button', this.onDeviceButtonHandler);
                                this.device.session.removeListener('pin', this.onDevicePinHandler);
                                this.device.session.removeListener('passphrase', this.onDevicePassphraseHandler);

                                this.device.release();
                                _context11.next = 8;
                                return this.device.session.release().then(function () {
                                    return response;
                                });

                            case 8:
                                return _context11.abrupt('return', _context11.sent);

                            case 9:
                            case 'end':
                                return _context11.stop();
                        }
                    }
                }, _callee11, this);
            }));

            function releaseDevice(_x11) {
                return _ref13.apply(this, arguments);
            }

            return releaseDevice;
        }()

        /*###################################################
        # Device events handlers
        ###################################################*/

    }, {
        key: 'onDevicePassphraseHandler',
        value: function onDevicePassphraseHandler(a, b) {
            console.log("PASSphrase handler - show form!", a, b);
            //this.emit(REQUEST_PASSPHRASE);
        }
    }, {
        key: 'onDeviceButtonHandler',
        value: function onDeviceButtonHandler(code) {
            var _this9 = this;

            console.log("onDeviceButtonHandler", code);

            var receive = function receive(type) {
                _this9.device.session.removeListener('receive', receive);
                _this9.device.session.removeListener('error', receive);
                //this.emit(SHOW_COMPONENT, 'global');
            };

            this.device.session.on('receive', receive); // unnecessary? after 1st confirm (host) will receive 'pin' event
            this.device.session.on('error', receive);

            // ButtonRequest_Other (verifyMessage)

            switch (code) {
                case 'ButtonRequest_ConfirmOutput':
                case 'ButtonRequest_SignTx':
                    this.emit(SHOW_COMPONENT, 'confirm_tx');
                    break;
                default:
                    this.emit(SHOW_COMPONENT, 'confirm');
                    break;
            }
        }
    }, {
        key: 'onDevicePinHandler',
        value: function onDevicePinHandler(type, callback) {
            console.log("onDevicePinHandler", type);

            this.emit(REQUEST_PIN, callback);
        }
    }]);

    return ConnectChannel;
}(_EventEmitter3.default);

exports.default = ConnectChannel;