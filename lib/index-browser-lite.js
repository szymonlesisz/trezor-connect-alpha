'use strict';

/**
 * (C) 2017 SatoshiLabs
 * TODO: description
 * GPLv3
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _ViewManager2 = require('./view/ViewManager');

var _ViewManager3 = _interopRequireDefault(_ViewManager2);

var _ConnectChannelBrowserLite = require('./connect/ConnectChannelBrowserLite');

var _ConnectChannelBrowserLite2 = _interopRequireDefault(_ConnectChannelBrowserLite);

var _pathUtils = require('./utils/pathUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TrezorConnect = function (_ViewManager) {
    _inherits(TrezorConnect, _ViewManager);

    function TrezorConnect() {
        _classCallCheck(this, TrezorConnect);

        return _possibleConstructorReturn(this, (TrezorConnect.__proto__ || Object.getPrototypeOf(TrezorConnect)).apply(this, arguments));
    }

    _createClass(TrezorConnect, null, [{
        key: 'getChannel',
        value: function getChannel() {
            return new _ConnectChannelBrowserLite2.default();
        }

        // TODO: override methods which are not available in LITE verison and return error

    }, {
        key: 'getXPubKey',
        value: function () {
            var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(args) {
                var path;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                path = (0, _pathUtils.getPathFromDescription)(args.description);

                                if (!(path === undefined || path === null)) {
                                    _context.next = 3;
                                    break;
                                }

                                return _context.abrupt('return', {
                                    success: false,
                                    message: 'Description is not specified. Account discovery is not supported in LITE version.'
                                });

                            case 3:
                                _context.next = 5;
                                return _get(TrezorConnect.__proto__ || Object.getPrototypeOf(TrezorConnect), 'getXPubKey', this).call(this, args);

                            case 5:
                                return _context.abrupt('return', _context.sent);

                            case 6:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function getXPubKey(_x) {
                return _ref.apply(this, arguments);
            }

            return getXPubKey;
        }()
    }]);

    return TrezorConnect;
}(_ViewManager3.default);

module.exports = TrezorConnect;