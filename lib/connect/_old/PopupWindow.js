'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _Popup2 = require('./Popup');

var _Popup3 = _interopRequireDefault(_Popup2);

var _ConnectUI = require('../view/ConnectUI');

var _ConnectUI2 = _interopRequireDefault(_ConnectUI);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var POPUP_INIT_TIMEOUT = 15000;
var POPUP_CLOSE_INTERVAL = 250;
var POPUP_WIDTH = 600;
var POPUP_HEIGHT = 500;

var POPUP_INNER_HTML = '\n    <!doctype html>\n    <head>\n        <meta charset="utf-8" />\n        <meta http-equiv="X-UA-Compatible" content="IE=edge" />\n        <meta name="viewport" content="width=device-width" />\n        <title>TREZOR Connect</title>\n        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:100,400,700" />\n        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto+Mono" />\n        <style>\n        body, html {\n            margin: 0;\n            padding: 0;\n        }\n        </style>\n    </head>\n    <body>\n        <div id="trezor-connect"></div>\n    </body>\n';

var createWindow = function createWindow() {

    var left = (window.screen.width - POPUP_WIDTH) / 2,
        top = (window.screen.height - POPUP_HEIGHT) / 2,
        width = POPUP_WIDTH,
        height = POPUP_HEIGHT,
        opts = 'width=' + width + '\n            ,height=' + height + '\n            ,left=' + left + '\n            ,top=' + top + '\n            ,menubar=no\n            ,toolbar=no\n            ,location=no\n            ,personalbar=no\n            ,status=no';
    return window.open('', name, opts);
};

var PopupWindow = function (_Popup) {
    _inherits(PopupWindow, _Popup);

    function PopupWindow() {
        _classCallCheck(this, PopupWindow);

        var _this = _possibleConstructorReturn(this, (PopupWindow.__proto__ || Object.getPrototypeOf(PopupWindow)).call(this));

        _this.ui = new _ConnectUI2.default();
        return _this;
    }

    _createClass(PopupWindow, [{
        key: 'open',
        value: function () {
            var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(args) {
                var _this2 = this;

                var resolved, timeout, interval;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:

                                this.popup = createWindow();
                                this.popup.document.body.innerHTML = POPUP_INNER_HTML;

                                this.ui.setContainer(this.popup.document.getElementById('trezor-connect'));
                                this.ui.open(args);

                                resolved = false;

                                // window open timeout

                                timeout = window.setTimeout(function () {
                                    console.log("TODO: Window does not open!");
                                    if (!resolved) {}
                                }, POPUP_INIT_TIMEOUT);

                                // window close listener

                                interval = window.setInterval(function () {
                                    if (_this2.popup.closed) {
                                        window.clearInterval(interval);
                                        window.clearTimeout(timeout);
                                        _this2.close(resolved);
                                    } else if (timeout !== null && _this2.popup.document.body !== null) {
                                        window.clearTimeout(timeout);
                                        timeout = null;
                                    }
                                }, POPUP_CLOSE_INTERVAL);
                                _context.next = 9;
                                return _get(PopupWindow.prototype.__proto__ || Object.getPrototypeOf(PopupWindow.prototype), 'open', this).call(this, args).then(function (response) {
                                    resolved = true;
                                    _this2.popup.close();
                                    return response;
                                });

                            case 9:
                                return _context.abrupt('return', _context.sent);

                            case 10:
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
        }()
    }, {
        key: 'showAlert',
        value: function showAlert(type) {
            console.log("SHOW UI ALERT", type);
            this.ui.showConfirmPromt();
        }
    }, {
        key: 'requestPin',
        value: function requestPin(callback) {
            this.ui.showPin(callback);
        }
    }, {
        key: 'close',
        value: function close(resolved) {
            console.log("WIDOW CLOSE!");
            this.popup = null;

            if (!resolved) {
                // TODO: reject promise from this.open
            }
        }
    }]);

    return PopupWindow;
}(_Popup3.default);

exports.default = PopupWindow;