'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _EventEmitter2 = require('../events/EventEmitter');

var _EventEmitter3 = _interopRequireDefault(_EventEmitter2);

var _preact = require('preact');

var _AlertComponent = require('./preact-components/AlertComponent');

var _AlertComponent2 = _interopRequireDefault(_AlertComponent);

var _DeviceInstructionsComponent = require('./preact-components/DeviceInstructionsComponent');

var _DeviceInstructionsComponent2 = _interopRequireDefault(_DeviceInstructionsComponent);

var _PinComponent = require('./preact-components/PinComponent');

var _PinComponent2 = _interopRequireDefault(_PinComponent);

var _XPubKeyComponent = require('./preact-components/XPubKeyComponent');

var _XPubKeyComponent2 = _interopRequireDefault(_XPubKeyComponent);

var _XPubAccountListComponent = require('./preact-components/XPubAccountListComponent');

var _XPubAccountListComponent2 = _interopRequireDefault(_XPubAccountListComponent);

var _LoaderComponent = require('./preact-components/LoaderComponent');

var _LoaderComponent2 = _interopRequireDefault(_LoaderComponent);

var _styleLess = require('./styles/style.less.js');

var _styleLess2 = _interopRequireDefault(_styleLess);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Class responsible for UI rendering
 */
var ViewRenderer = function (_EventEmitter) {
    _inherits(ViewRenderer, _EventEmitter);

    function ViewRenderer() {
        _classCallCheck(this, ViewRenderer);

        return _possibleConstructorReturn(this, (ViewRenderer.__proto__ || Object.getPrototypeOf(ViewRenderer)).call(this));
    }

    _createClass(ViewRenderer, [{
        key: 'injectStyleSheet',
        value: function injectStyleSheet() {
            var doc = this.container.ownerDocument;
            var head = doc.head || doc.getElementsByTagName('head')[0];
            var style = document.createElement('style');
            style.type = 'text/css';
            if (style.styleSheet) {
                style.styleSheet.cssText = _styleLess2.default;
            } else {
                style.appendChild(document.createTextNode(_styleLess2.default));
            }
            head.append(style);

            console.log("STYLEZ", _styleLess2.default);
        }
    }, {
        key: 'setContainer',
        value: function setContainer(container) {
            this.container = container;
            this.injectStyleSheet();
        }
    }, {
        key: 'open',
        value: function open(args) {
            this.props = args;
            this.showLoader();
        }
    }, {
        key: 'showOperation',
        value: function showOperation(type) {
            this.props = _extends({}, this.props, { operation: type });
            this.render();
        }

        // show text info

    }, {
        key: 'showAlert',
        value: function showAlert(type) {
            if (this.currentComponent !== _AlertComponent2.default) {
                this.currentComponent = _AlertComponent2.default;
                this.props = _extends({}, this.props, { alertType: type });
                this.render();
                console.log("ALERTT!", type);
            }
        }

        // show confirmation

    }, {
        key: 'showConfirmPromt',
        value: function showConfirmPromt(type) {
            this.currentComponent = _DeviceInstructionsComponent2.default;
            this.render();
        }
    }, {
        key: 'updateView',
        value: function updateView(data) {
            if (this.props.type === 'xpubAccountList') {
                if (this.props.nodes !== undefined) {
                    this.props.nodes.push(data);
                } else {
                    this.props = _extends({}, this.props, { nodes: [data] });
                }
            }
            this.render();
        }
    }, {
        key: 'requestConfirm',
        value: function requestConfirm(data) {
            var _this2 = this;

            if (data.type === 'xpubKey') {
                this.currentComponent = _XPubKeyComponent2.default;
            } else if (data.type === 'xpubAccountList') {
                this.currentComponent = _XPubAccountListComponent2.default;
            }

            this.props = _extends({}, this.props, data, { showLoader: function showLoader() {
                    _this2.showLoader();
                } });
            this.render();
        }
    }, {
        key: 'requestPin',
        value: function requestPin(callback) {
            var _this3 = this;

            this.currentComponent = _PinComponent2.default;
            this.props = _extends({}, this.props, { showLoader: function showLoader() {
                    _this3.showLoader();
                }, callback: callback });
            this.render();
        }
    }, {
        key: 'showLoader',
        value: function showLoader() {
            this.currentComponent = _LoaderComponent2.default;
            this.render();
        }
    }, {
        key: 'render',
        value: function render() {
            var component = (0, _preact.h)(this.currentComponent, this.props);
            (0, _preact.render)(component, this.container, this.container.lastChild);
        }
    }, {
        key: 'close',
        value: function close() {
            while (this.container.firstChild) {
                this.container.removeChild(this.container.firstChild);
            }
        }
    }]);

    return ViewRenderer;
}(_EventEmitter3.default);

exports.default = ViewRenderer;