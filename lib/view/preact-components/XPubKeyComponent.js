'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _preact = require('preact');

var _ContainerComponent = require('./ContainerComponent');

var _ContainerComponent2 = _interopRequireDefault(_ContainerComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var XPubKeyComponent = function (_Component) {
    (0, _inherits3.default)(XPubKeyComponent, _Component);

    function XPubKeyComponent(props) {
        (0, _classCallCheck3.default)(this, XPubKeyComponent);
        return (0, _possibleConstructorReturn3.default)(this, _Component.call(this, props));
    }

    XPubKeyComponent.prototype.keyboardHandler = function keyboardHandler(event) {
        event.preventDefault();
        switch (event.keyCode) {
            // action
            case 8:
                // backspace
                this.cancel();
                break;
            case 13:
                // enter,
                this.submit();
                break;
        }
    };

    XPubKeyComponent.prototype.componentDidMount = function componentDidMount() {
        // PopupWindow has different "window" object than PopupLayer
        // that's why we need to access it thru DOM Element - Preact base
        var doc = this.base.ownerDocument;
        var win = doc.defaultView || doc.parentWindow;

        this.keyboardHandler = this.keyboardHandler.bind(this);
        win.addEventListener('keydown', this.keyboardHandler);
    };

    XPubKeyComponent.prototype.componentWillUnmount = function componentWillUnmount() {
        var doc = this.base.ownerDocument;
        var win = doc.defaultView || doc.parentWindow;
        win.removeEventListener('keydown', this.keyboardHandler);
    };

    XPubKeyComponent.prototype.submit = function submit() {
        this.props.showLoader();
        this.props.callback(true);
    };

    XPubKeyComponent.prototype.cancel = function cancel() {
        this.props.callback(false);
    };

    XPubKeyComponent.prototype.render = function render(props) {
        var _this2 = this;

        return (0, _preact.h)(
            _ContainerComponent2.default,
            props,
            (0, _preact.h)(
                'p',
                { className: 'alert_heading' },
                'Export public key for ',
                (0, _preact.h)('br', null),
                (0, _preact.h)(
                    'strong',
                    null,
                    props.xpubkey
                ),
                '?'
            ),
            (0, _preact.h)(
                'div',
                null,
                (0, _preact.h)(
                    'button',
                    { type: 'button', onClick: function onClick() {
                            _this2.submit();
                        } },
                    'Export'
                ),
                (0, _preact.h)(
                    'button',
                    { type: 'button', onClick: function onClick() {
                            _this2.cancel();
                        } },
                    'Cancel'
                )
            )
        );
    };

    return XPubKeyComponent;
}(_preact.Component);

exports.default = XPubKeyComponent;