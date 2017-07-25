'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _EventEmitter2 = require('../../events/EventEmitter');

var _EventEmitter3 = _interopRequireDefault(_EventEmitter2);

var _ViewRenderer = require('../ViewRenderer');

var _ViewRenderer2 = _interopRequireDefault(_ViewRenderer);

var _ConnectChannel = require('../../connect/ConnectChannel');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AbstractContainer = function (_EventEmitter) {
    _inherits(AbstractContainer, _EventEmitter);

    function AbstractContainer(channel) {
        _classCallCheck(this, AbstractContainer);

        var _this = _possibleConstructorReturn(this, (AbstractContainer.__proto__ || Object.getPrototypeOf(AbstractContainer)).call(this));

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

    _createClass(AbstractContainer, [{
        key: 'showComponent',
        value: function showComponent(type) {

            if (type.indexOf('alert') === 0) {
                this.renderer.showAlert(type);
            } else {
                this.renderer.showConfirmPromt(type);
            }
        }
    }, {
        key: 'showOperation',
        value: function showOperation(type) {
            this.renderer.showOperation(type);
        }
    }, {
        key: 'updateView',
        value: function updateView(data) {
            this.renderer.updateView(data);
        }
    }, {
        key: 'requestConfirm',
        value: function requestConfirm(data) {
            this.renderer.requestConfirm(data);
        }
    }, {
        key: 'requestPin',
        value: function requestPin(callback) {
            this.renderer.requestPin(callback);
        }
    }, {
        key: 'requestPassphrase',
        value: function requestPassphrase(callback) {
            // to override
            //this.renderer.requestPassphrase(callback);
        }
    }, {
        key: 'open',
        value: function () {
            var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(args) {
                var method;
                return regeneratorRuntime.wrap(function _callee$(_context) {
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
        }()
    }]);

    return AbstractContainer;
}(_EventEmitter3.default);

exports.default = AbstractContainer;