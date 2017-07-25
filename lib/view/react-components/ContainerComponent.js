'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _radium = require('radium');

var _radium2 = _interopRequireDefault(_radium);

var _styles = require('../styles');

var _styles2 = _interopRequireDefault(_styles);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ContainerComponent = function (_React$Component) {
    _inherits(ContainerComponent, _React$Component);

    function ContainerComponent(props) {
        _classCallCheck(this, ContainerComponent);

        var _this = _possibleConstructorReturn(this, (ContainerComponent.__proto__ || Object.getPrototypeOf(ContainerComponent)).call(this, props));

        _this.state = {
            width: 0,
            height: 0
        };
        return _this;
    }

    _createClass(ContainerComponent, [{
        key: 'onResize',
        value: function onResize() {
            var width = this.state.window.innerWidth || this.state.document.documentElement.clientWidth || this.state.document.body.clientWidth;
            var height = this.state.window.innerHeight || this.state.document.documentElement.clientHeight || this.state.document.body.clientHeight;

            this.setState({
                width: width,
                height: height
            });

            //styles.background.width = width + 'px';
            //styles.background.height = height + 'px';
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {

            // PopupWindow has different "window" object than PopupModal
            // that's why we need to access it thru DOM Element - React container

            var doc = _reactDom2.default.findDOMNode(this).ownerDocument;
            var win = doc.defaultView || doc.parentWindow;
            var isPopup = doc !== document;

            this.setState({
                isPopup: isPopup,
                document: doc,
                window: win
            });

            // change styles
            if (isPopup) {
                //styles.background = {};
                //styles.container = styles.containerWindow;
            }

            if (this.props.icon) {
                _styles2.default.icon = _extends({}, _styles2.default.icon, { display: 'block' });
            }

            // TODO:
            // - disable site scrolling (https://github.com/limonte/sweetalert2/blob/master/src/sweetalert2.js)
            // - conditionally handle resize for PopupModal

            this.onResize = this.onResize.bind(this);
            win.addEventListener('resize', this.onResize);
            //this.onResize();

            // TODO: close popup on bg click
            var bg = this.refs.background;
            bg.addEventListener('click', function (event) {
                if (event.target === event.currentTarget) {}
            });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.state.window.removeEventListener('resize', this.onResize);
        }
    }, {
        key: 'render',
        value: function render() {
            return h(
                'div',
                { style: _styles2.default.background, ref: 'background' },
                h(
                    'div',
                    { style: _styles2.default.container },
                    h(
                        'div',
                        { style: _styles2.default.header },
                        h(
                            'div',
                            { style: _styles2.default.logo },
                            h(
                                'svg',
                                { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 2567.5 722.3', width: '100%', height: '100%' },
                                h('path', { id: 'rect25', d: 'M1186 2932.6h46.2v147H1186v-147z' }),
                                h('path', { id: 'path7', d: 'M249 0C149.9 0 69.7 80.2 69.7 179.3v67.2C34.9 252.8 0 261.2 0 272.1v350.7s0 9.7 10.9 14.3c39.5 16 194.9 71 230.6 83.6 4.6 1.7 5.9 1.7 7.1 1.7 1.7 0 2.5 0 7.1-1.7 35.7-12.6 191.5-67.6 231-83.6 10.1-4.2 10.5-13.9 10.5-13.9V272.1c0-10.9-34.4-19.7-69.3-25.6v-67.2C428.4 80.2 347.7 0 249 0zm0 85.7c58.4 0 93.7 35.3 93.7 93.7v58.4c-65.5-4.6-121.4-4.6-187.3 0v-58.4c0-58.5 35.3-93.7 93.6-93.7zm-.4 238.1c81.5 0 149.9 6.3 149.9 17.6v218.8c0 3.4-.4 3.8-3.4 5-2.9 1.3-139 50.4-139 50.4s-5.5 1.7-7.1 1.7c-1.7 0-7.1-2.1-7.1-2.1s-136.1-49.1-139-50.4-3.4-1.7-3.4-5V341c-.8-11.3 67.6-17.2 149.1-17.2z' }),
                                h(
                                    'g',
                                    { id: 'g3222', transform: 'translate(91.363 -287.434) scale(.95575)' },
                                    h('path', { id: 'path13', d: 'M666.6 890V639.3H575v-89.9h285.6v89.9h-90.7V890H666.6z' }),
                                    h('path', { id: 'path15', d: 'M1092 890l-47-107.1h-37.4V890H904.3V549.4h181.8c79.8 0 122.6 52.9 122.6 116.7 0 58.8-34 89.9-61.3 103.3l61.7 120.5H1092zm12.2-223.9c0-18.5-16.4-26.5-33.6-26.5h-63v53.8h63c17.2-.4 33.6-8.4 33.6-27.3z' }),
                                    h('path', { id: 'path17', d: 'M1262.9 890V549.4h258.3v89.9h-155.4v33.6h151.6v89.9h-151.6v37.4h155.4V890h-258.3z' }),
                                    h('path', { id: 'path19', d: 'M1574.9 890.4v-81.9l129.8-168.8h-129.8v-89.9h265.8v81.1l-130.2 169.7h134v89.9l-269.6-.1z' }),
                                    h('path', { id: 'path21', d: 'M1869.7 720.3c0-104.6 81.1-176.4 186.5-176.4 105 0 186.5 71.4 186.5 176.4 0 104.6-81.1 176-186.5 176s-186.5-71.4-186.5-176zm268 0c0-47.5-32.3-85.3-81.9-85.3-49.6 0-81.9 37.8-81.9 85.3s32.3 85.3 81.9 85.3c50 0 81.9-37.8 81.9-85.3z' }),
                                    h('path', { id: 'path23', d: 'M2473.6 890.4l-47-107.1h-37.4v107.1h-103.3V549.8h181.8c79.8 0 122.6 52.9 122.6 116.7 0 58.8-34 89.9-61.3 103.3l61.7 120.5h-117.1zm12.6-224.3c0-18.5-16.4-26.5-33.6-26.5h-63v53.8h63c17.3-.4 33.6-8.4 33.6-27.3z' })
                                )
                            )
                        ),
                        h(
                            'div',
                            { style: _styles2.default.headerRight },
                            h(
                                'div',
                                { style: _styles2.default.icon },
                                h('img', { src: this.props.icon, width: 'auto', height: '100%', alt: '' })
                            ),
                            h(
                                'div',
                                { style: _styles2.default.operation },
                                this.props.operation
                            ),
                            h(
                                'div',
                                { style: _styles2.default.origin },
                                this.props.origin
                            )
                        )
                    ),
                    h(
                        'div',
                        { style: _styles2.default.body },
                        this.props.children
                    )
                )
            );
        }
    }]);

    return ContainerComponent;
}(_react2.default.Component);

exports.default = (0, _radium2.default)(ContainerComponent);