'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ConnectChannel2 = require('./ConnectChannel');

var _ConnectChannel3 = _interopRequireDefault(_ConnectChannel2);

var _DeviceList = require('../device/DeviceList');

var _DeviceList2 = _interopRequireDefault(_DeviceList);

var _trezorLink = require('trezor-link');

var _trezorLink2 = _interopRequireDefault(_trezorLink);

var _installers = require('../utils/installers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Bridge = _trezorLink2.default.Bridge,
    Extension = _trezorLink2.default.Extension,
    Lowlevel = _trezorLink2.default.Lowlevel,
    WebUsb = _trezorLink2.default.WebUsb,
    Fallback = _trezorLink2.default.Fallback;

var sharedWorkerFactory = function sharedWorkerFactory() {
    throw new Error('Shared worker not set.');
};
_DeviceList2.default._setTransport(function () {
    return new Fallback([new Extension(), new Bridge(), new Lowlevel(new WebUsb(), function () {
        return sharedWorkerFactory();
    })]);
});

_DeviceList2.default._setFetch(window.fetch);
(0, _installers.setFetch)(window.fetch);

var ConnectChannelBrowserLite = function (_ConnectChannel) {
    _inherits(ConnectChannelBrowserLite, _ConnectChannel);

    function ConnectChannelBrowserLite() {
        _classCallCheck(this, ConnectChannelBrowserLite);

        return _possibleConstructorReturn(this, (ConnectChannelBrowserLite.__proto__ || Object.getPrototypeOf(ConnectChannelBrowserLite)).apply(this, arguments));
    }

    return ConnectChannelBrowserLite;
}(_ConnectChannel3.default);

exports.default = ConnectChannelBrowserLite;