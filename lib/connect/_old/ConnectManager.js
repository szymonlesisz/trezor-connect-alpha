'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _Popup = require('./Popup');

var _PopupWindow = require('./PopupWindow');

var _PopupWindow2 = _interopRequireDefault(_PopupWindow);

var _PopupModal = require('./PopupModal');

var _PopupModal2 = _interopRequireDefault(_PopupModal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ConnectManager = function () {
    function ConnectManager() {
        (0, _classCallCheck3.default)(this, ConnectManager);
    }

    ConnectManager.send = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(args) {
            var container, p;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            container = args.container;
                            p = container === 'popup' ? new _PopupWindow2.default() : new _PopupModal2.default();
                            // p.on(EVENT_MESSAGE, m => { console.log("M EVENT!", m)} );
                            // p.on(EVENT_ERROR, m => { console.log("M ERROR!", m)} );


                            _context.next = 4;
                            return p.open(args);

                        case 4:
                            return _context.abrupt('return', _context.sent);

                        case 5:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function send(_x) {
            return _ref.apply(this, arguments);
        }

        return send;
    }();

    return ConnectManager;
}();

ConnectManager._popup = null;
exports.default = ConnectManager;
;