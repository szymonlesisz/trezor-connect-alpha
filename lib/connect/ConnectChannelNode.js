'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ConnectChannel2 = require('./ConnectChannel');

var _ConnectChannel3 = _interopRequireDefault(_ConnectChannel2);

var _DeviceList = require('../device/DeviceList');

var _DeviceList2 = _interopRequireDefault(_DeviceList);

var _trezorLinkNode = require('trezor-link-node');

var _trezorLinkNode2 = _interopRequireDefault(_trezorLinkNode);

var _installers = require('../utils/installers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
    _inherits(ConnectChannelNode, _ConnectChannel);

    function ConnectChannelNode() {
        _classCallCheck(this, ConnectChannelNode);

        return _possibleConstructorReturn(this, (ConnectChannelNode.__proto__ || Object.getPrototypeOf(ConnectChannelNode)).call(this));
    }

    return ConnectChannelNode;
}(_ConnectChannel3.default);

exports.default = ConnectChannelNode;