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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ConnectChannelBrowser = require('./connect/ConnectChannelBrowser');

var _ConnectChannelBrowser2 = _interopRequireDefault(_ConnectChannelBrowser);

var _ConnectChannel = require('./connect/ConnectChannel');

var _ConnectUI = require('./view/ConnectUI');

var _ConnectUI2 = _interopRequireDefault(_ConnectUI);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TrezorConnect = function (_Component) {
    (0, _inherits3.default)(TrezorConnect, _Component);

    function TrezorConnect(props) {
        (0, _classCallCheck3.default)(this, TrezorConnect);

        var _this = (0, _possibleConstructorReturn3.default)(this, _Component.call(this, props));

        _this.channel = new _ConnectChannelBrowser2.default();
        _this.channel.on(_ConnectChannel.SHOW_ALERT, _this.showAlert.bind(_this));
        _this.channel.on(_ConnectChannel.REQUEST_PIN, _this.requestPin.bind(_this));

        _this.ui = new _ConnectUI2.default(null);
        return _this;
    }

    TrezorConnect.prototype.componentDidMount = function componentDidMount() {
        this.ui.setContainer(ReactDOM.findDOMNode(this));
    };

    TrezorConnect.prototype.showAlert = function showAlert(type) {
        this.ui.showConfirmPromt();
    };

    TrezorConnect.prototype.requestPin = function requestPin(callback) {
        this.ui.showPin(callback);
    };

    // Public methods exposed to parent thru refference

    TrezorConnect.prototype.requestLogin = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(args) {
            var _this2 = this;

            return _regenerator2.default.wrap(function _callee$(_context) {
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
    }();

    TrezorConnect.prototype.accountInfo = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
            return _regenerator2.default.wrap(function _callee2$(_context2) {
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
    }();

    TrezorConnect.prototype.render = function render() {
        return h('div', { id: 'trezor-connect' });
    };

    return TrezorConnect;
}(_react.Component);

exports.default = TrezorConnect;


module.exports = TrezorConnect;