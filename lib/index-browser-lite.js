'use strict';

/**
 * (C) 2017 SatoshiLabs
 * TODO: description
 * GPLv3
 */

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

var _ViewManager2 = require('./view/ViewManager');

var _ViewManager3 = _interopRequireDefault(_ViewManager2);

var _ConnectChannelBrowserLite = require('./connect/ConnectChannelBrowserLite');

var _ConnectChannelBrowserLite2 = _interopRequireDefault(_ConnectChannelBrowserLite);

var _pathUtils = require('./utils/pathUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TrezorConnect = function (_ViewManager) {
    (0, _inherits3.default)(TrezorConnect, _ViewManager);

    function TrezorConnect() {
        (0, _classCallCheck3.default)(this, TrezorConnect);
        return (0, _possibleConstructorReturn3.default)(this, _ViewManager.apply(this, arguments));
    }

    TrezorConnect.getChannel = function getChannel() {
        return new _ConnectChannelBrowserLite2.default();
    };

    // TODO: override methods which are not available in LITE verison and return error


    TrezorConnect.getXPubKey = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(args) {
            var path;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            path = (0, _pathUtils.getPathFromDescription)(args.description);

                            if (!(path === undefined || path === null)) {
                                _context.next = 3;
                                break;
                            }

                            return _context.abrupt('return', {
                                success: false,
                                message: 'Description is not specified. Account discovery is not supported in LITE version.'
                            });

                        case 3:
                            _context.next = 5;
                            return _ViewManager.getXPubKey.call(this, args);

                        case 5:
                            return _context.abrupt('return', _context.sent);

                        case 6:
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

    return TrezorConnect;
}(_ViewManager3.default);

module.exports = TrezorConnect;