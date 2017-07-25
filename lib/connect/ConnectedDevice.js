'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _semverCompare = require('semver-compare');

var _semverCompare2 = _interopRequireDefault(_semverCompare);

var _bitcoinjsLibZcash = require('bitcoinjs-lib-zcash');

var bitcoin = _interopRequireWildcard(_bitcoinjsLibZcash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ConnectedDevice = function () {
    function ConnectedDevice(session, device) {
        _classCallCheck(this, ConnectedDevice);

        this.device = device;
        this.session = session;
        this.features = device.features;
    }

    _createClass(ConnectedDevice, [{
        key: 'isBootloader',
        value: function isBootloader() {
            return this.features.bootloader_mode;
        }
    }, {
        key: 'isInitialized',
        value: function isInitialized() {
            return this.features.initialized;
        }
    }, {
        key: 'getVersion',
        value: function getVersion() {
            return [this.features.major_version, this.features.minor_version, this.features.patch_version].join('.');
        }
    }, {
        key: 'atLeast',
        value: function atLeast(version) {
            return (0, _semverCompare2.default)(this.getVersion(), version) >= 0;
        }
    }, {
        key: 'getCoin',
        value: function getCoin(name) {
            var coins = this.features.coins;
            for (var i = 0; i < coins.length; i++) {
                if (coins[i].coin_name === name) {
                    return coins[i];
                }
            }
            throw new Error('Device does not support given coin type');
        }
    }, {
        key: 'getNode',
        value: function getNode(path) {
            return this.session.getPublicKey(path).then(function (_ref) {
                var message = _ref.message;
                return bitcoin.HDNode.fromBase58(message.xpub);
            });
        }
    }, {
        key: 'release',
        value: function release() {
            this.device.release();
        }
    }]);

    return ConnectedDevice;
}();

exports.default = ConnectedDevice;