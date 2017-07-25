'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ConnectChannelBrowser = require('./connect/ConnectChannelBrowser');

var _ConnectChannelBrowser2 = _interopRequireDefault(_ConnectChannelBrowser);

var _ConnectChannel = require('./connect/ConnectChannel');

var _ConnectUI = require('./view/ConnectUI');

var _ConnectUI2 = _interopRequireDefault(_ConnectUI);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TrezorConnect = function (_Component) {
    _inherits(TrezorConnect, _Component);

    function TrezorConnect(props) {
        _classCallCheck(this, TrezorConnect);

        var _this = _possibleConstructorReturn(this, (TrezorConnect.__proto__ || Object.getPrototypeOf(TrezorConnect)).call(this, props));

        _this.channel = new _ConnectChannelBrowser2.default();
        _this.channel.on(_ConnectChannel.SHOW_ALERT, _this.showAlert.bind(_this));
        _this.channel.on(_ConnectChannel.REQUEST_PIN, _this.requestPin.bind(_this));

        _this.ui = new _ConnectUI2.default(null);
        return _this;
    }

    _createClass(TrezorConnect, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.ui.setContainer(ReactDOM.findDOMNode(this));
        }
    }, {
        key: 'showAlert',
        value: function showAlert(type) {
            this.ui.showConfirmPromt();
        }
    }, {
        key: 'requestPin',
        value: function requestPin(callback) {
            this.ui.showPin(callback);
        }

        // Public methods exposed to parent thru refference

    }, {
        key: 'requestLogin',
        value: function () {
            var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(args) {
                var _this2 = this;

                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                // TODO: open in new window if this.props.container === 'popup'
                                this.ui.open();
                                _context.next = 3;
                                return this.channel.requestLogin(args).then(function (response) {
                                    _this2.ui.close();
                                    return response;
                                });

                            case 3:
                                return _context.abrupt('return', _context.sent);

                            case 4:
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
        key: 'accountInfo',
        value: function () {
            var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                return _context2.abrupt('return', null);

                            case 1:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function accountInfo() {
                return _ref2.apply(this, arguments);
            }

            return accountInfo;
        }()
    }, {
        key: 'render',
        value: function render() {
            return h('div', { id: 'trezor-connect' });
        }
    }]);

    return TrezorConnect;
}(_react.Component);

exports.default = TrezorConnect;


module.exports = TrezorConnect;