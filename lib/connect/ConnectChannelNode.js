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

var _trezorLinkNode = require('trezor-link-node');

var _trezorLinkNode2 = _interopRequireDefault(_trezorLinkNode);

var _installers = require('../utils/installers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Bridge = _trezorLinkNode2.default.Bridge,
    Fallback = _trezorLinkNode2.default.Fallback,
    Lowlevel = _trezorLinkNode2.default.Lowlevel,
    NodeHid = _trezorLinkNode2.default.NodeHid;

var fetch = void 0;

if (typeof window === 'undefined') {
    fetch = require('node-fetch');
} else {
    fetch = window.fetch;
}

_DeviceList2.default._setTransport(function () {
    return new Fallback([new Bridge(), new Lowlevel(new NodeHid())]);
});
_DeviceList2.default._setFetch(fetch);
(0, _installers.setFetch)(fetch);

var ConnectChannelNode = function (_ConnectChannel) {
    (0, _inherits3.default)(ConnectChannelNode, _ConnectChannel);

    function ConnectChannelNode() {
        (0, _classCallCheck3.default)(this, ConnectChannelNode);
        return (0, _possibleConstructorReturn3.default)(this, _ConnectChannel.call(this));
    }

    return ConnectChannelNode;
}(_ConnectChannel3.default);

exports.default = ConnectChannelNode;