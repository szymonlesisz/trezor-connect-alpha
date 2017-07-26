'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractContainer2 = require('./AbstractContainer');

var _AbstractContainer3 = _interopRequireDefault(_AbstractContainer2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var Popup = function (_AbstractContainer) {
    (0, _inherits3.default)(Popup, _AbstractContainer);

    function Popup(channel) {
        (0, _classCallCheck3.default)(this, Popup);
        return (0, _possibleConstructorReturn3.default)(this, _AbstractContainer.call(this, channel));
    }

    Popup.prototype.open = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(args) {
            var _this2 = this;

            var resolved, timeout, interval;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:

                            this.popup = createWindow();
                            this.popup.document.body.innerHTML = POPUP_INNER_HTML;

                            this.renderer.setContainer(this.popup.document.getElementById('trezor-connect'));
                            this.renderer.open(args);

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
                            return _AbstractContainer.prototype.open.call(this, args).then(function (response) {
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
    }();

    Popup.prototype.close = function close(resolved) {
        console.log("WIDOW CLOSE!");
        this.popup = null;

        if (!resolved) {
            // TODO: reject promise from this.open
        }
    };

    return Popup;
}(_AbstractContainer3.default);

exports.default = Popup;