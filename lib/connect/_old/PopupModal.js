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

var _Popup2 = require('./Popup');

var _Popup3 = _interopRequireDefault(_Popup2);

var _ConnectUI = require('../view/ConnectUI');

var _ConnectUI2 = _interopRequireDefault(_ConnectUI);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PopupModal = function (_Popup) {
    (0, _inherits3.default)(PopupModal, _Popup);

    function PopupModal(args) {
        (0, _classCallCheck3.default)(this, PopupModal);

        var _this = (0, _possibleConstructorReturn3.default)(this, _Popup.call(this));

        _this.args = args;
        _this.ui = new _ConnectUI2.default(document.getElementById('trezor-connect'));
        return _this;
    }

    PopupModal.prototype.open = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(args) {
            var _this2 = this;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:

                            // render React UI into <div id="trezor-connect" /> element
                            this.ui.open(args);

                            _context.next = 3;
                            return _Popup.prototype.open.call(this, args).then(function (response) {
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

        function open(_x) {
            return _ref.apply(this, arguments);
        }

        return open;
    }();

    PopupModal.prototype.showAlert = function showAlert(type) {
        this.ui.showConfirmPromt(type);
    };

    PopupModal.prototype.showOperation = function showOperation(type) {
        this.ui.showOperation(type);
    };

    PopupModal.prototype.requestConfirm = function requestConfirm(data) {
        this.ui.requestConfirm(data);
    };

    PopupModal.prototype.requestPin = function requestPin(callback) {
        this.ui.requestPin(callback);
    };

    return PopupModal;
}(_Popup3.default);

exports.default = PopupModal;