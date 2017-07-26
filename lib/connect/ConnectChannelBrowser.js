'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

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
    (0, _inherits3.default)(ConnectChannelBrowser, _ConnectChannel);

    function ConnectChannelBrowser() {
        (0, _classCallCheck3.default)(this, ConnectChannelBrowser);
        return (0, _possibleConstructorReturn3.default)(this, _ConnectChannel.apply(this, arguments));
    }

    ConnectChannelBrowser.prototype.getAccount = function getAccount(node) {
        return new _Account2.default(node);
    };

    /**
     * Method
     *
     * @param {Object} description
     * @returns {Promise.<Object>}
     */


    ConnectChannelBrowser.prototype.getXPubKey = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(args) {
            var _this2 = this;

            var path;
            return _regenerator2.default.wrap(function _callee$(_context) {
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
                            return _ConnectChannel.prototype.getXPubKey.call(this, args);

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
    }();

    return ConnectChannelBrowser;
}(_ConnectChannel3.default);

exports.default = ConnectChannelBrowser;