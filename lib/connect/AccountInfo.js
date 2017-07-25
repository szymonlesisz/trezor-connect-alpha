'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AccountInfo = function () {
    function AccountInfo(description) {
        _classCallCheck(this, AccountInfo);
    }

    _createClass(AccountInfo, [{
        key: 'getAccountByDescription',
        value: function () {
            var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(description) {
                return regeneratorRuntime.wrap(function _callee$(_context) {
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
        }()
    }, {
        key: 'waitForAccount',
        value: function () {
            var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(description) {
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
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
        }()
    }, {
        key: 'getAccountById',
        value: function () {
            var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(id) {
                var onEnd, accountP;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
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
        }()
    }, {
        key: 'getAccountByXpub',
        value: function () {
            var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(description) {
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
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
        }()
    }]);

    return AccountInfo;
}();

exports.default = AccountInfo;