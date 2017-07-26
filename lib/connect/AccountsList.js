'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _pathUtils = require('../utils/pathUtils');

var _promiseUtils = require('../utils/promiseUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import type HDNode from 'bitcoinjs-lib-zcash';

var AccountsList = function () {
    AccountsList.get = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(device, updateCallback) {
            var list;
            return _regenerator2.default.wrap(function _callee$(_context) {
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
    }();

    function AccountsList() {
        (0, _classCallCheck3.default)(this, AccountsList);
    }

    return AccountsList;
}();

exports.default = AccountsList;