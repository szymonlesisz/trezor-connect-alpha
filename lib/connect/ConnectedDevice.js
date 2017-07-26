'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _semverCompare = require('semver-compare');

var _semverCompare2 = _interopRequireDefault(_semverCompare);

var _bitcoinjsLibZcash = require('bitcoinjs-lib-zcash');

var bitcoin = _interopRequireWildcard(_bitcoinjsLibZcash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ConnectedDevice = function () {
    function ConnectedDevice(session, device) {
        (0, _classCallCheck3.default)(this, ConnectedDevice);

        this.device = device;
        this.session = session;
        this.features = device.features;
    }

    ConnectedDevice.prototype.isBootloader = function isBootloader() {
        return this.features.bootloader_mode;
    };

    ConnectedDevice.prototype.isInitialized = function isInitialized() {
        return this.features.initialized;
    };

    ConnectedDevice.prototype.getVersion = function getVersion() {
        return [this.features.major_version, this.features.minor_version, this.features.patch_version].join('.');
    };

    ConnectedDevice.prototype.atLeast = function atLeast(version) {
        return (0, _semverCompare2.default)(this.getVersion(), version) >= 0;
    };

    ConnectedDevice.prototype.getCoin = function getCoin(name) {
        var coins = this.features.coins;
        for (var i = 0; i < coins.length; i++) {
            if (coins[i].coin_name === name) {
                return coins[i];
            }
        }
        throw new Error('Device does not support given coin type');
    };

    ConnectedDevice.prototype.getNode = function getNode(path) {
        return this.session.getPublicKey(path).then(function (_ref) {
            var message = _ref.message;
            return bitcoin.HDNode.fromBase58(message.xpub);
        });
    };

    ConnectedDevice.prototype.release = function release() {
        this.device.release();
    };

    return ConnectedDevice;
}();

exports.default = ConnectedDevice;