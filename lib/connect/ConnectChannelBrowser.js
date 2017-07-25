'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _ConnectChannel2 = require('./ConnectChannel');

var _ConnectChannel3 = _interopRequireDefault(_ConnectChannel2);

var _DeviceList = require('../device/DeviceList');

var _DeviceList2 = _interopRequireDefault(_DeviceList);

var _trezorLink = require('trezor-link');

var _trezorLink2 = _interopRequireDefault(_trezorLink);

var _installers = require('../utils/installers');

var _pathUtils = require('../utils/pathUtils');

var _Account = require('./Account');

var _Account2 = _interopRequireDefault(_Account);

var _AccountsList = require('./AccountsList');

var _AccountsList2 = _interopRequireDefault(_AccountsList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Bridge = _trezorLink2.default.Bridge,
    Extension = _trezorLink2.default.Extension,
    Lowlevel = _trezorLink2.default.Lowlevel,
    WebUsb = _trezorLink2.default.WebUsb,
    Fallback = _trezorLink2.default.Fallback;

var sharedWorkerFactory = function sharedWorkerFactory() {
    throw new Error('Shared worker not set.');
};
_DeviceList2.default._setTransport(function () {
    return new Fallback([new Extension(), new Bridge(), new Lowlevel(new WebUsb(), function () {
        return sharedWorkerFactory();
    })]);
});

_DeviceList2.default._setFetch(window.fetch);
(0, _installers.setFetch)(window.fetch);

var ConnectChannelBrowser = function (_ConnectChannel) {
    _inherits(ConnectChannelBrowser, _ConnectChannel);

    function ConnectChannelBrowser() {
        _classCallCheck(this, ConnectChannelBrowser);

        return _possibleConstructorReturn(this, (ConnectChannelBrowser.__proto__ || Object.getPrototypeOf(ConnectChannelBrowser)).apply(this, arguments));
    }

    _createClass(ConnectChannelBrowser, [{
        key: 'getAccount',
        value: function getAccount(node) {
            return new _Account2.default(node);
        }

        /**
         * Method
         *
         * @param {Object} description
         * @returns {Promise.<Object>}
         */

    }, {
        key: 'getXPubKey',
        value: function () {
            var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(args) {
                var _this2 = this;

                var path;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                path = (0, _pathUtils.getPathFromDescription)(args.description);
                                //let path = getPathFromDescription(args.descriptionFake);
                                //if (path !== undefined && path !== null && !args.accountDetail) {

                                if (args.accountDiscovery) {
                                    _context.next = 5;
                                    break;
                                }

                                _context.next = 4;
                                return _get(ConnectChannelBrowser.prototype.__proto__ || Object.getPrototypeOf(ConnectChannelBrowser.prototype), 'getXPubKey', this).call(this, args);

                            case 4:
                                return _context.abrupt('return', _context.sent);

                            case 5:

                                // custom implementation with Account discovery

                                this.emit(_ConnectChannel2.SHOW_OPERATION, 'operation_getXPubKey');

                                _context.next = 8;
                                return this.initDevice().then(function (device) {
                                    var updateAccountList = function updateAccountList(node) {
                                        var acc = new _Account2.default(node);
                                        //acc.discover();
                                        _this2.emit(_ConnectChannel2.UPDATE_VIEW, node);
                                    };

                                    _AccountsList2.default.get(device, updateAccountList).then(function (list) {
                                        console.log("ACC list", list);
                                        // TODO
                                    });

                                    // wait for account selection
                                    return new Promise(function (resolve) {
                                        _this2.emit(_ConnectChannel2.REQUEST_CONFIRM, {
                                            type: 'xpubAccountList',
                                            callback: function callback(submit) {
                                                return resolve(submit);
                                            }
                                        });
                                    });
                                }).then(function (submit) {
                                    if (submit) {
                                        if (path) {
                                            return _this2.device.session.getPublicKey(path);
                                        } else {}
                                    } else {
                                        // TODO: all errors should be stored in one place, not hardcoded
                                        throw Error('Not confirmed');
                                    }
                                });

                            case 8:
                                return _context.abrupt('return', _context.sent);

                            case 9:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function getXPubKey(_x) {
                return _ref.apply(this, arguments);
            }

            return getXPubKey;
        }()
    }]);

    return ConnectChannelBrowser;
}(_ConnectChannel3.default);

exports.default = ConnectChannelBrowser;