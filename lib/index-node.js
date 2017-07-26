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

var _ConnectChannelNode = require('./connect/ConnectChannelNode');

var _ConnectChannelNode2 = _interopRequireDefault(_ConnectChannelNode);

var _ConnectChannel = require('./connect/ConnectChannel');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEBUG = false;

var TrezorConnect = function () {
    function TrezorConnect() {
        (0, _classCallCheck3.default)(this, TrezorConnect);
    }

    TrezorConnect.requestLogin = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(args) {
            var channel;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            channel = new _ConnectChannelNode2.default();

                            channel.on(_ConnectChannel.SHOW_ALERT, TrezorConnect.showAlert);
                            channel.on(_ConnectChannel.REQUEST_PIN, TrezorConnect.requestPin);
                            _context.next = 5;
                            return channel.requestLogin().then(function (response) {
                                console.log("requestLogin response", response);
                                return response;
                            });

                        case 5:
                            return _context.abrupt('return', _context.sent);

                        case 6:
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
    }();

    TrezorConnect.showAlert = function showAlert(type) {
        //console.log("SHOW ALERT", type)
    };

    TrezorConnect.requestPin = function requestPin(callback) {
        console.log('Please enter PIN. The positions:');
        console.log('7 8 9');
        console.log('4 5 6');
        console.log('1 2 3');
    };

    return TrezorConnect;
}();

module.exports = TrezorConnect;