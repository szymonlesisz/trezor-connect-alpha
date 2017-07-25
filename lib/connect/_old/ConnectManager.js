'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Popup = require('./Popup');

var _PopupWindow = require('./PopupWindow');

var _PopupWindow2 = _interopRequireDefault(_PopupWindow);

var _PopupModal = require('./PopupModal');

var _PopupModal2 = _interopRequireDefault(_PopupModal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ConnectManager = function () {
    function ConnectManager() {
        _classCallCheck(this, ConnectManager);
    }

    _createClass(ConnectManager, null, [{
        key: 'send',
        value: function () {
            var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(args) {
                var container, p;
                return regeneratorRuntime.wrap(function _callee$(_context) {
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
        }()
    }]);

    return ConnectManager;
}();

ConnectManager._popup = null;
exports.default = ConnectManager;
;