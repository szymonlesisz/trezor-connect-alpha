'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _pathUtils = require('../utils/pathUtils');

var _promiseUtils = require('../utils/promiseUtils');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//import type HDNode from 'bitcoinjs-lib-zcash';

var AccountsList = function () {
    _createClass(AccountsList, null, [{
        key: 'get',
        value: function () {
            var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(device, updateCallback) {
                var list;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                list = [];
                                _context.next = 3;
                                return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].reduce(function (promise, current) {
                                    return promise.then(function (hdnode) {
                                        var path = (0, _pathUtils.getPathFromIndex)(current);
                                        return device.getNode(path).then(function (node) {

                                            list.push(node);

                                            if (updateCallback !== undefined)
                                                //updateCallback(list);
                                                updateCallback(path, node);
                                            return list;
                                        });
                                    });
                                }, Promise.resolve());

                            case 3:
                                return _context.abrupt('return', _context.sent);

                            case 4:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function get(_x, _x2) {
                return _ref.apply(this, arguments);
            }

            return get;
        }()
    }]);

    function AccountsList() {
        _classCallCheck(this, AccountsList);
    }

    return AccountsList;
}();

exports.default = AccountsList;