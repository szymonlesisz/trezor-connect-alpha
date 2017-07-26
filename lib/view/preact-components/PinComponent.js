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

var PinComponent = function (_Component) {
    (0, _inherits3.default)(PinComponent, _Component);

    function PinComponent(props) {
        (0, _classCallCheck3.default)(this, PinComponent);

        var _this = (0, _possibleConstructorReturn3.default)(this, _Component.call(this, props));

        _this.state = {
            pin: ''
        };
        return _this;
    }

    PinComponent.prototype.add = function add(char) {
        var pin = this.state.pin + char;
        this.setState({ pin: pin });
    };

    PinComponent.prototype.keyboardHandler = function keyboardHandler(event) {
        event.preventDefault();
        switch (event.keyCode) {
            // action
            case 8:
                // backspace
                var pin = this.state.pin;
                if (pin.length > 0) pin = pin.substring(0, pin.length - 1);
                this.setState({ pin: pin });
                break;
            case 13:
                // enter,
                this.submit();
                break;
            // numeric and numpad
            case 49:
            case 97:
                this.add(1);
                break;
            case 50:
            case 98:
                this.add(2);
                break;
            case 51:
            case 99:
                this.add(3);
                break;
            case 52:
            case 100:
                this.add(4);
                break;
            case 53:
            case 101:
                this.add(5);
                break;
            case 54:
            case 102:
                this.add(6);
                break;
            case 55:
            case 103:
                this.add(7);
                break;
            case 56:
            case 104:
                this.add(8);
                break;
            case 57:
            case 105:
                this.add(9);
                break;
        }
    };

    PinComponent.prototype.componentDidMount = function componentDidMount() {
        // PopupWindow has different "window" object than PopupLayer
        // that's why we need to access it thru DOM Element - Preact base
        var doc = this.base.ownerDocument;
        var win = doc.defaultView || doc.parentWindow;

        this.keyboardHandler = this.keyboardHandler.bind(this);
        win.addEventListener('keydown', this.keyboardHandler);
    };

    PinComponent.prototype.componentWillUnmount = function componentWillUnmount() {
        var doc = this.base.ownerDocument;
        var win = doc.defaultView || doc.parentWindow;
        win.removeEventListener('keydown', this.keyboardHandler);
    };

    PinComponent.prototype.submit = function submit() {
        this.props.showLoader();
        this.props.callback(null, this.state.pin);
    };

    PinComponent.prototype.render = function render(props) {
        var _this2 = this;

        return (0, _preact.h)(
            _ContainerComponent2.default,
            props,
            (0, _preact.h)(
                'div',
                { id: 'pin_header' },
                'Please enter your PIN.'
            ),
            (0, _preact.h)(
                'div',
                { id: 'pin_subheader' },
                'Look at the device for number positions.'
            ),
            (0, _preact.h)(
                'div',
                null,
                (0, _preact.h)(
                    'button',
                    { type: 'button', onClick: function onClick() {
                            _this2.add(7);
                        } },
                    '\u2022'
                ),
                (0, _preact.h)(
                    'button',
                    { type: 'button', onClick: function onClick() {
                            _this2.add(8);
                        } },
                    '\u2022'
                ),
                (0, _preact.h)(
                    'button',
                    { type: 'button', onClick: function onClick() {
                            _this2.add(9);
                        } },
                    '\u2022'
                )
            ),
            (0, _preact.h)(
                'div',
                null,
                (0, _preact.h)(
                    'button',
                    { type: 'button', onClick: function onClick() {
                            _this2.add(4);
                        } },
                    '\u2022'
                ),
                (0, _preact.h)(
                    'button',
                    { type: 'button', onClick: function onClick() {
                            _this2.add(5);
                        } },
                    '\u2022'
                ),
                (0, _preact.h)(
                    'button',
                    { type: 'button', onClick: function onClick() {
                            _this2.add(6);
                        } },
                    '\u2022'
                )
            ),
            (0, _preact.h)(
                'div',
                null,
                (0, _preact.h)(
                    'button',
                    { type: 'button', onClick: function onClick() {
                            _this2.add(1);
                        } },
                    '\u2022'
                ),
                (0, _preact.h)(
                    'button',
                    { type: 'button', onClick: function onClick() {
                            _this2.add(2);
                        } },
                    '\u2022'
                ),
                (0, _preact.h)(
                    'button',
                    { type: 'button', onClick: function onClick() {
                            _this2.add(3);
                        } },
                    '\u2022'
                )
            ),
            (0, _preact.h)(
                'button',
                { onClick: function onClick() {
                        _this2.submit();
                    } },
                'CONFIRM'
            ),
            (0, _preact.h)(
                'div',
                null,
                this.state.pin
            ),
            (0, _preact.h)(
                'div',
                { id: 'pin_input_row' },
                (0, _preact.h)('input', { type: 'password', id: 'pin', name: 'pin', autocomplete: 'off', maxlength: '9', value: this.state.pin, disabled: true }),
                (0, _preact.h)(
                    'button',
                    { type: 'button', id: 'pin_backspace', onClick: function onClick() {
                            _this2.submit();
                        } },
                    '\u232B'
                )
            ),
            (0, _preact.h)(
                'div',
                { id: 'pin_enter' },
                (0, _preact.h)(
                    'button',
                    { type: 'button', onClick: function onClick() {
                            _this2.submit();
                        } },
                    'Enter'
                )
            )
        );
    };

    return PinComponent;
}(_preact.Component);

exports.default = PinComponent;