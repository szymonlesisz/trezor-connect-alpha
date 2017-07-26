'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AccountInfo = function () {
    function AccountInfo(description) {
        (0, _classCallCheck3.default)(this, AccountInfo);
    }

    AccountInfo.prototype.getAccountByDescription = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(description) {
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (!(description == null)) {
                                _context.next = 4;
                                break;
                            }

                            _context.next = 3;
                            return this.waitForAccount();

                        case 3:
                            return _context.abrupt('return', _context.sent);

                        case 4:
                            if (!(typeof description === 'string' && description.substring(0, 4) === 'xpub')) {
                                _context.next = 8;
                                break;
                            }

                            _context.next = 7;
                            return this.getAccountByXpub(description);

                        case 7:
                            return _context.abrupt('return', _context.sent);

                        case 8:
                            if (isNaN(description)) {
                                _context.next = 12;
                                break;
                            }

                            _context.next = 11;
                            return this.getAccountById(parseInt(description));

                        case 11:
                            return _context.abrupt('return', _context.sent);

                        case 12:
                            throw new Error('Wrongly formatted description.');

                        case 13:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function getAccountByDescription(_x) {
            return _ref.apply(this, arguments);
        }

        return getAccountByDescription;
    }();

    AccountInfo.prototype.waitForAccount = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(description) {
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function waitForAccount(_x2) {
            return _ref2.apply(this, arguments);
        }

        return waitForAccount;
    }();

    AccountInfo.prototype.getAccountById = function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(id) {
            var onEnd, accountP;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            onEnd = function onEnd() {};

                            accountP = Account.fromDevice(global.device, id, createCryptoChannel(), createBlockchain());
                            return _context3.abrupt('return', accountP.then(function (account) {
                                return promptInfoPermission(id).then(function () {
                                    return account.discover(onEnd).then(function () {
                                        return account;
                                    });
                                });
                            }));

                        case 3:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function getAccountById(_x3) {
            return _ref3.apply(this, arguments);
        }

        return getAccountById;
    }();

    AccountInfo.prototype.getAccountByXpub = function () {
        var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(description) {
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function getAccountByXpub(_x4) {
            return _ref4.apply(this, arguments);
        }

        return getAccountByXpub;
    }();

    return AccountInfo;
}();

exports.default = AccountInfo;