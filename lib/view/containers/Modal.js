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

var _AbstractContainer2 = require('./AbstractContainer');

var _AbstractContainer3 = _interopRequireDefault(_AbstractContainer2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Modal = function (_AbstractContainer) {
    (0, _inherits3.default)(Modal, _AbstractContainer);

    function Modal(channel) {
        (0, _classCallCheck3.default)(this, Modal);
        return (0, _possibleConstructorReturn3.default)(this, _AbstractContainer.call(this, channel));
    }

    Modal.prototype.open = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(args) {
            var _this2 = this;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:

                            // TODO: check if div exists, if not create it as a last body child

                            // render React UI into <div id="trezor-connect" /> element
                            this.renderer.setContainer(document.getElementById('trezor-connect'));
                            this.renderer.open(args);

                            _context.next = 4;
                            return _AbstractContainer.prototype.open.call(this, args).then(function (response) {
                                _this2.renderer.close();
                                return response;
                            });

                        case 4:
                            return _context.abrupt('return', _context.sent);

                        case 5:
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

    return Modal;
}(_AbstractContainer3.default);

exports.default = Modal;