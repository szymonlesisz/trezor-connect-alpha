'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Popup = require('./containers/Popup');

var _Popup2 = _interopRequireDefault(_Popup);

var _Modal = require('./containers/Modal');

var _Modal2 = _interopRequireDefault(_Modal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Absract wrapper
 */
var ViewManager = function () {
    function ViewManager() {
        _classCallCheck(this, ViewManager);
    }

    _createClass(ViewManager, null, [{
        key: 'parseArgs',
        value: function parseArgs(args) {

            if (args.coin) {
                // TODO: verify coin name
            }
            return _extends({}, args, {
                icon: args.icon || null,
                container: args.container || 'modal',
                firmware: args.firmware || null
            });
        }
    }, {
        key: 'getChannel',
        value: function getChannel() {
            // to override
        }
    }, {
        key: 'getViewContainer',
        value: function getViewContainer(args) {
            var channel = this.getChannel();
            var container = args.container === 'popup' ? new _Popup2.default(channel) : new _Modal2.default(channel);
            return container;
        }
    }, {
        key: 'requestLogin',
        value: function () {
            var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(args) {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                args = this.parseArgs(args);
                                _context.next = 3;
                                return this.getViewContainer(args).open(_extends({
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
        }()
    }, {
        key: 'signMessage',
        value: function () {
            var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(args) {
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                args = this.parseArgs(args);
                                _context2.next = 3;
                                return this.getViewContainer(args).open(_extends({
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
        }()
    }, {
        key: 'verifyMessage',
        value: function () {
            var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(args) {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                args = this.parseArgs(args);
                                _context3.next = 3;
                                return this.getViewContainer(args).open(_extends({
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
        }()
    }, {
        key: 'getXPubKey',
        value: function () {
            var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(args) {
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                args = this.parseArgs(args);
                                _context4.next = 3;
                                return this.getViewContainer(args).open(_extends({
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
        }()
    }, {
        key: 'getAccountInfo',
        value: function () {
            var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(args) {
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                args = this.parseArgs(args);
                                _context5.next = 3;
                                return this.getViewContainer(args).open(_extends({
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
        }()
    }, {
        key: 'getCypherKeyValue',
        value: function () {
            var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(args) {
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                args = this.parseArgs(args);
                                _context6.next = 3;
                                return this.getViewContainer(args).open(_extends({
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
        }()
    }]);

    return ViewManager;
}();

exports.default = ViewManager;
;