'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _ContainerComponent = require('./ContainerComponent');

var _ContainerComponent2 = _interopRequireDefault(_ContainerComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var XPubComponent = function (_React$Component) {
    _inherits(XPubComponent, _React$Component);

    function XPubComponent(props) {
        _classCallCheck(this, XPubComponent);

        return _possibleConstructorReturn(this, (XPubComponent.__proto__ || Object.getPrototypeOf(XPubComponent)).call(this, props));
    }

    _createClass(XPubComponent, [{
        key: 'keyboardHandler',
        value: function keyboardHandler(event) {
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
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            // PopupWindow has different "window" object than PopupLayer
            // that's why we need to access it thru DOM Element - React container
            var doc = _reactDom2.default.findDOMNode(this).ownerDocument;
            var win = doc.defaultView || doc.parentWindow;

            this.keyboardHandler = this.keyboardHandler.bind(this);
            win.addEventListener('keydown', this.keyboardHandler);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            var doc = _reactDom2.default.findDOMNode(this).ownerDocument;
            var win = doc.defaultView || doc.parentWindow;
            win.removeEventListener('keydown', this.keyboardHandler);
        }
    }, {
        key: 'submit',
        value: function submit() {
            // TODO show loader in ui
            this.props.showLoader();
            this.props.callback(true);
        }
    }, {
        key: 'cancel',
        value: function cancel() {
            this.props.callback(false);
        }
    }, {
        key: 'render',
        value: function render() {
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
        }
    }]);

    return XPubComponent;
}(_react2.default.Component);

exports.default = XPubComponent;