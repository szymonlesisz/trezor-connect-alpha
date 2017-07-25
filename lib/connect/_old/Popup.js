'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.EVENT_ERROR = exports.EVENT_MESSAGE = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _EventEmitter2 = require('../events/EventEmitter');

var _EventEmitter3 = _interopRequireDefault(_EventEmitter2);

var _ConnectChannelBrowser = require('./ConnectChannelBrowser');

var _ConnectChannelBrowser2 = _interopRequireDefault(_ConnectChannelBrowser);

var _ConnectChannel = require('./ConnectChannel');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EVENT_MESSAGE = exports.EVENT_MESSAGE = 'EVENT_MESSAGE';
var EVENT_ERROR = exports.EVENT_ERROR = 'EVENT_ERROR';

var Popup = function (_EventEmitter) {
    _inherits(Popup, _EventEmitter);

    function Popup() {
        _classCallCheck(this, Popup);

        var _this = _possibleConstructorReturn(this, (Popup.__proto__ || Object.getPrototypeOf(Popup)).call(this));

        _this.channel = new _ConnectChannelBrowser2.default();
        _this.channel.on(_ConnectChannel.SHOW_ALERT, _this.showAlert.bind(_this));
        _this.channel.on(_ConnectChannel.SHOW_OPERATION, _this.showOperation.bind(_this));
        _this.channel.on(_ConnectChannel.REQUEST_CONFIRM, _this.requestConfirm.bind(_this));
        _this.channel.on(_ConnectChannel.REQUEST_PIN, _this.requestPin.bind(_this));
        _this.channel.on(_ConnectChannel.REQUEST_PASSPHRASE, _this.requestPassphrase.bind(_this));
        return _this;
    }

    _createClass(Popup, [{
        key: 'showAlert',
        value: function showAlert(type) {
            // to override
        }
    }, {
        key: 'showOperation',
        value: function showOperation(type) {
            // to override
        }
    }, {
        key: 'requestConfirm',
        value: function requestConfirm(callback) {
            // to override
        }
    }, {
        key: 'requestPin',
        value: function requestPin(callback) {
            // to override
        }
    }, {
        key: 'requestPassphrase',
        value: function requestPassphrase(callback) {
            // to override
        }
    }, {
        key: 'open',
        value: function () {
            var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(args) {
                var type, description;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                type = args.type, description = args.description;
                                _context.t0 = type;
                                _context.next = _context.t0 === 'login' ? 4 : _context.t0 === 'signmessage' ? 7 : _context.t0 === 'xpubkey' ? 10 : _context.t0 === 'accountinfo' ? 13 : 16;
                                break;

                            case 4:
                                _context.next = 6;
                                return this.channel.requestLogin(args);

                            case 6:
                                return _context.abrupt('return', _context.sent);

                            case 7:
                                _context.next = 9;
                                return this.channel.signMessage();

                            case 9:
                                return _context.abrupt('return', _context.sent);

                            case 10:
                                _context.next = 12;
                                return this.channel.getXPubKey(description);

                            case 12:
                                return _context.abrupt('return', _context.sent);

                            case 13:
                                _context.next = 15;
                                return this.channel.getAccountInfo(description);

                            case 15:
                                return _context.abrupt('return', _context.sent);

                            case 16:
                                throw new Error('Unknown type');

                            case 17:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function open(_x) {
                return _ref.apply(this, arguments);
            }

            return open;
        }()
    }]);

    return Popup;
}(_EventEmitter3.default);

exports.default = Popup;