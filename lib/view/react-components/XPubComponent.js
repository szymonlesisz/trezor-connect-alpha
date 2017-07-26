'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _ContainerComponent = require('./ContainerComponent');

var _ContainerComponent2 = _interopRequireDefault(_ContainerComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var XPubComponent = function (_React$Component) {
    (0, _inherits3.default)(XPubComponent, _React$Component);

    function XPubComponent(props) {
        (0, _classCallCheck3.default)(this, XPubComponent);
        return (0, _possibleConstructorReturn3.default)(this, _React$Component.call(this, props));
    }

    XPubComponent.prototype.keyboardHandler = function keyboardHandler(event) {
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

    XPubComponent.prototype.componentDidMount = function componentDidMount() {
        // PopupWindow has different "window" object than PopupLayer
        // that's why we need to access it thru DOM Element - React container
        var doc = _reactDom2.default.findDOMNode(this).ownerDocument;
        var win = doc.defaultView || doc.parentWindow;

        this.keyboardHandler = this.keyboardHandler.bind(this);
        win.addEventListener('keydown', this.keyboardHandler);
    };

    XPubComponent.prototype.componentWillUnmount = function componentWillUnmount() {
        var doc = _reactDom2.default.findDOMNode(this).ownerDocument;
        var win = doc.defaultView || doc.parentWindow;
        win.removeEventListener('keydown', this.keyboardHandler);
    };

    XPubComponent.prototype.submit = function submit() {
        // TODO show loader in ui
        this.props.showLoader();
        this.props.callback(true);
    };

    XPubComponent.prototype.cancel = function cancel() {
        this.props.callback(false);
    };

    XPubComponent.prototype.render = function render() {
        var _this2 = this;

        return h(
            _ContainerComponent2.default,
            this.props,
            h(
                'p',
                { className: 'alert_heading' },
                'Export public key for',
                h('br', null),
                h(
                    'strong',
                    null,
                    this.props.xpubkey
                ),
                '?'
            ),
            h(
                'div',
                null,
                h(
                    'button',
                    { type: 'button', onClick: function onClick() {
                            _this2.submit();
                        } },
                    'Export'
                ),
                h(
                    'button',
                    { type: 'button', onClick: function onClick() {
                            _this2.cancel();
                        } },
                    'Cancel'
                )
            )
        );
    };

    return XPubComponent;
}(_react2.default.Component);

exports.default = XPubComponent;