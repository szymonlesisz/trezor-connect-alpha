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

var _EventEmitter2 = require('../../events/EventEmitter');

var _EventEmitter3 = _interopRequireDefault(_EventEmitter2);

var _ViewRenderer = require('../ViewRenderer');

var _ViewRenderer2 = _interopRequireDefault(_ViewRenderer);

var _ConnectChannel = require('../../connect/ConnectChannel');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AbstractContainer = function (_EventEmitter) {
    (0, _inherits3.default)(AbstractContainer, _EventEmitter);

    function AbstractContainer(channel) {
        (0, _classCallCheck3.default)(this, AbstractContainer);

        var _this = (0, _possibleConstructorReturn3.default)(this, _EventEmitter.call(this));

        _this.channel = channel;
        _this.channel.on(_ConnectChannel.SHOW_COMPONENT, _this.showComponent.bind(_this));
        _this.channel.on(_ConnectChannel.SHOW_OPERATION, _this.showOperation.bind(_this));
        _this.channel.on(_ConnectChannel.UPDATE_VIEW, _this.updateView.bind(_this));
        _this.channel.on(_ConnectChannel.REQUEST_CONFIRM, _this.requestConfirm.bind(_this));
        _this.channel.on(_ConnectChannel.REQUEST_PIN, _this.requestPin.bind(_this));
        _this.channel.on(_ConnectChannel.REQUEST_PASSPHRASE, _this.requestPassphrase.bind(_this));

        _this.renderer = new _ViewRenderer2.default();
        return _this;
    }

    AbstractContainer.prototype.showComponent = function showComponent(type) {

        if (type.indexOf('alert') === 0) {
            this.renderer.showAlert(type);
        } else {
            this.renderer.showConfirmPromt(type);
        }
    };

    AbstractContainer.prototype.showOperation = function showOperation(type) {
        this.renderer.showOperation(type);
    };

    AbstractContainer.prototype.updateView = function updateView(data) {
        this.renderer.updateView(data);
    };

    AbstractContainer.prototype.requestConfirm = function requestConfirm(data) {
        this.renderer.requestConfirm(data);
    };

    AbstractContainer.prototype.requestPin = function requestPin(callback) {
        this.renderer.requestPin(callback);
    };

    AbstractContainer.prototype.requestPassphrase = function requestPassphrase(callback) {
        // to override
        //this.renderer.requestPassphrase(callback);
    };

    AbstractContainer.prototype.open = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(args) {
            var method;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            method = this.channel[args.method];

                            if (!(method === undefined)) {
                                _context.next = 3;
                                break;
                            }

                            return _context.abrupt('return', Error('Method ' + args.method + ' not found.'));

                        case 3:
                            _context.next = 5;
                            return method.call(this.channel, args);

                        case 5:
                            return _context.abrupt('return', _context.sent);

                        case 6:
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

    return AbstractContainer;
}(_EventEmitter3.default);

exports.default = AbstractContainer;