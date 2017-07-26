'use strict';

exports.__esModule = true;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

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

/**
 * Class responsible for UI rendering
 */
var ViewRenderer = function (_EventEmitter) {
    (0, _inherits3.default)(ViewRenderer, _EventEmitter);

    function ViewRenderer() {
        (0, _classCallCheck3.default)(this, ViewRenderer);
        return (0, _possibleConstructorReturn3.default)(this, _EventEmitter.call(this));
    }

    ViewRenderer.prototype.injectStyleSheet = function injectStyleSheet() {
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
    };

    ViewRenderer.prototype.setContainer = function setContainer(container) {
        this.container = container;
        this.injectStyleSheet();
    };

    ViewRenderer.prototype.open = function open(args) {
        this.props = args;
        this.showLoader();
    };

    ViewRenderer.prototype.showOperation = function showOperation(type) {
        this.props = (0, _extends3.default)({}, this.props, { operation: type });
        this.render();
    };

    // show text info


    ViewRenderer.prototype.showAlert = function showAlert(type) {
        if (this.currentComponent !== _AlertComponent2.default) {
            this.currentComponent = _AlertComponent2.default;
            this.props = (0, _extends3.default)({}, this.props, { alertType: type });
            this.render();
            console.log("ALERTT!", type);
        }
    };

    // show confirmation


    ViewRenderer.prototype.showConfirmPromt = function showConfirmPromt(type) {
        this.currentComponent = _DeviceInstructionsComponent2.default;
        this.render();
    };

    ViewRenderer.prototype.updateView = function updateView(data) {
        if (this.props.type === 'xpubAccountList') {
            if (this.props.nodes !== undefined) {
                this.props.nodes.push(data);
            } else {
                this.props = (0, _extends3.default)({}, this.props, { nodes: [data] });
            }
        }
        this.render();
    };

    ViewRenderer.prototype.requestConfirm = function requestConfirm(data) {
        var _this2 = this;

        if (data.type === 'xpubKey') {
            this.currentComponent = _XPubKeyComponent2.default;
        } else if (data.type === 'xpubAccountList') {
            this.currentComponent = _XPubAccountListComponent2.default;
        }

        this.props = (0, _extends3.default)({}, this.props, data, { showLoader: function showLoader() {
                _this2.showLoader();
            } });
        this.render();
    };

    ViewRenderer.prototype.requestPin = function requestPin(callback) {
        var _this3 = this;

        this.currentComponent = _PinComponent2.default;
        this.props = (0, _extends3.default)({}, this.props, { showLoader: function showLoader() {
                _this3.showLoader();
            }, callback: callback });
        this.render();
    };

    ViewRenderer.prototype.showLoader = function showLoader() {
        this.currentComponent = _LoaderComponent2.default;
        this.render();
    };

    ViewRenderer.prototype.render = function render() {
        var component = (0, _preact.h)(this.currentComponent, this.props);
        (0, _preact.render)(component, this.container, this.container.lastChild);
    };

    ViewRenderer.prototype.close = function close() {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
    };

    return ViewRenderer;
}(_EventEmitter3.default);

exports.default = ViewRenderer;