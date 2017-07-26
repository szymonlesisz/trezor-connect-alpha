'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _Popup = require('./containers/Popup');

var _Popup2 = _interopRequireDefault(_Popup);

var _Modal = require('./containers/Modal');

var _Modal2 = _interopRequireDefault(_Modal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Absract wrapper
 */
var ViewManager = function () {
    function ViewManager() {
        (0, _classCallCheck3.default)(this, ViewManager);
    }

    ViewManager.parseArgs = function parseArgs(args) {

        if (args.coin) {
            // TODO: verify coin name
        }
        return (0, _extends3.default)({}, args, {
            icon: args.icon || null,
            container: args.container || 'modal',
            firmware: args.firmware || null
        });
    };

    ViewManager.getChannel = function getChannel() {
        // to override
    };

    ViewManager.getViewContainer = function getViewContainer(args) {
        var channel = this.getChannel();
        var container = args.container === 'popup' ? new _Popup2.default(channel) : new _Modal2.default(channel);
        return container;
    };

    ViewManager.requestLogin = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(args) {
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            args = this.parseArgs(args);
                            _context.next = 3;
                            return this.getViewContainer(args).open((0, _extends3.default)({
                                method: 'requestLogin'
                            }, args));

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

    ViewManager.signMessage = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(args) {
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            args = this.parseArgs(args);
                            _context2.next = 3;
                            return this.getViewContainer(args).open((0, _extends3.default)({
                                method: 'signMessage'
                            }, args));

                        case 3:
                            return _context2.abrupt('return', _context2.sent);

                        case 4:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function signMessage(_x2) {
            return _ref2.apply(this, arguments);
        }

        return signMessage;
    }();

    ViewManager.verifyMessage = function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(args) {
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            args = this.parseArgs(args);
                            _context3.next = 3;
                            return this.getViewContainer(args).open((0, _extends3.default)({
                                method: 'verifyMessage'
                            }, args));

                        case 3:
                            return _context3.abrupt('return', _context3.sent);

                        case 4:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function verifyMessage(_x3) {
            return _ref3.apply(this, arguments);
        }

        return verifyMessage;
    }();

    ViewManager.getXPubKey = function () {
        var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(args) {
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            args = this.parseArgs(args);
                            _context4.next = 3;
                            return this.getViewContainer(args).open((0, _extends3.default)({
                                method: 'getXPubKey'
                            }, args));

                        case 3:
                            return _context4.abrupt('return', _context4.sent);

                        case 4:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function getXPubKey(_x4) {
            return _ref4.apply(this, arguments);
        }

        return getXPubKey;
    }();

    ViewManager.getAccountInfo = function () {
        var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(args) {
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            args = this.parseArgs(args);
                            _context5.next = 3;
                            return this.getViewContainer(args).open((0, _extends3.default)({
                                method: 'getAccountInfo'
                            }, args));

                        case 3:
                            return _context5.abrupt('return', _context5.sent);

                        case 4:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this);
        }));

        function getAccountInfo(_x5) {
            return _ref5.apply(this, arguments);
        }

        return getAccountInfo;
    }();

    ViewManager.getCypherKeyValue = function () {
        var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(args) {
            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            args = this.parseArgs(args);
                            _context6.next = 3;
                            return this.getViewContainer(args).open((0, _extends3.default)({
                                method: 'getCypherKeyValue'
                            }, args));

                        case 3:
                            return _context6.abrupt('return', _context6.sent);

                        case 4:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this);
        }));

        function getCypherKeyValue(_x6) {
            return _ref6.apply(this, arguments);
        }

        return getCypherKeyValue;
    }();

    return ViewManager;
}();

exports.default = ViewManager;
;