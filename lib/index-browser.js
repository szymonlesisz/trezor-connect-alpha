'use strict';

/**
 * (C) 2017 SatoshiLabs
 * TODO: description
 * GPLv3
 */

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _ViewManager2 = require('./view/ViewManager');

var _ViewManager3 = _interopRequireDefault(_ViewManager2);

var _ConnectChannelBrowser = require('./connect/ConnectChannelBrowser');

var _ConnectChannelBrowser2 = _interopRequireDefault(_ConnectChannelBrowser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TrezorConnect = function (_ViewManager) {
    (0, _inherits3.default)(TrezorConnect, _ViewManager);

    function TrezorConnect() {
        (0, _classCallCheck3.default)(this, TrezorConnect);
        return (0, _possibleConstructorReturn3.default)(this, _ViewManager.apply(this, arguments));
    }

    TrezorConnect.getChannel = function getChannel() {
        return new _ConnectChannelBrowser2.default();
    };

    return TrezorConnect;
}(_ViewManager3.default);

module.exports = TrezorConnect;