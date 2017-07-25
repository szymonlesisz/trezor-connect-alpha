'use strict';

/**
 * (C) 2017 SatoshiLabs
 * TODO: description
 * GPLv3
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ConnectChannelNode = require('./connect/ConnectChannelNode');

var _ConnectChannelNode2 = _interopRequireDefault(_ConnectChannelNode);

var _ConnectChannel = require('./connect/ConnectChannel');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEBUG = false;

var TrezorConnect = function () {
    function TrezorConnect() {
        _classCallCheck(this, TrezorConnect);
    }

    _createClass(TrezorConnect, null, [{
        key: 'requestLogin',
        value: function () {
            var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(args) {
                var channel;
                return regeneratorRuntime.wrap(function _callee$(_context) {
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
        }()
    }, {
        key: 'showAlert',
        value: function showAlert(type) {
            //console.log("SHOW ALERT", type)
        }
    }, {
        key: 'requestPin',
        value: function requestPin(callback) {
            console.log('Please enter PIN. The positions:');
            console.log('7 8 9');
            console.log('4 5 6');
            console.log('1 2 3');
        }
    }]);

    return TrezorConnect;
}();

module.exports = TrezorConnect;