'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _ConnectChannel2 = require('./ConnectChannel');

var _ConnectChannel3 = _interopRequireDefault(_ConnectChannel2);

var _DeviceList = require('../device/DeviceList');

var _DeviceList2 = _interopRequireDefault(_DeviceList);

var _trezorLink = require('trezor-link');

var _trezorLink2 = _interopRequireDefault(_trezorLink);

var _installers = require('../utils/installers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    (0, _inherits3.default)(ConnectChannelBrowserLite, _ConnectChannel);

    function ConnectChannelBrowserLite() {
        (0, _classCallCheck3.default)(this, ConnectChannelBrowserLite);
        return (0, _possibleConstructorReturn3.default)(this, _ConnectChannel.apply(this, arguments));
    }

    return ConnectChannelBrowserLite;
}(_ConnectChannel3.default);

exports.default = ConnectChannelBrowserLite;