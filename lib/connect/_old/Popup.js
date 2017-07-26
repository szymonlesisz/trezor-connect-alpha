'use strict';

exports.__esModule = true;
exports.EVENT_ERROR = exports.EVENT_MESSAGE = undefined;

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

var _EventEmitter2 = require('../events/EventEmitter');

var _EventEmitter3 = _interopRequireDefault(_EventEmitter2);

var _ConnectChannelBrowser = require('./ConnectChannelBrowser');

var _ConnectChannelBrowser2 = _interopRequireDefault(_ConnectChannelBrowser);

var _ConnectChannel = require('./ConnectChannel');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EVENT_MESSAGE = exports.EVENT_MESSAGE = 'EVENT_MESSAGE';
var EVENT_ERROR = exports.EVENT_ERROR = 'EVENT_ERROR';

var Popup = function (_EventEmitter) {
    (0, _inherits3.default)(Popup, _EventEmitter);

    function Popup() {
        (0, _classCallCheck3.default)(this, Popup);

        var _this = (0, _possibleConstructorReturn3.default)(this, _EventEmitter.call(this));

        _this.channel = new _ConnectChannelBrowser2.default();
        _this.channel.on(_ConnectChannel.SHOW_ALERT, _this.showAlert.bind(_this));
        _this.channel.on(_ConnectChannel.SHOW_OPERATION, _this.showOperation.bind(_this));
        _this.channel.on(_ConnectChannel.REQUEST_CONFIRM, _this.requestConfirm.bind(_this));
        _this.channel.on(_ConnectChannel.REQUEST_PIN, _this.requestPin.bind(_this));
        _this.channel.on(_ConnectChannel.REQUEST_PASSPHRASE, _this.requestPassphrase.bind(_this));
        return _this;
    }

    Popup.prototype.showAlert = function showAlert(type) {
        // to override
    };

    Popup.prototype.showOperation = function showOperation(type) {
        // to override
    };

    Popup.prototype.requestConfirm = function requestConfirm(callback) {
        // to override
    };

    Popup.prototype.requestPin = function requestPin(callback) {
        // to override
    };

    Popup.prototype.requestPassphrase = function requestPassphrase(callback) {
        // to override
    };

    Popup.prototype.open = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(args) {
            var type, description;
            return _regenerator2.default.wrap(function _callee$(_context) {
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
    }();

    return Popup;
}(_EventEmitter3.default);

exports.default = Popup;