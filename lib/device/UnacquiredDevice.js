'use strict';

exports.__esModule = true;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _Device = require('./Device');

var _Device2 = _interopRequireDefault(_Device);

var _EventEmitter2 = require('../events/EventEmitter');

var _EventEmitter3 = _interopRequireDefault(_EventEmitter2);

var _FlowEvents = require('../events/FlowEvents');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UnacquiredDevice = function (_EventEmitter) {
    (0, _inherits3.default)(UnacquiredDevice, _EventEmitter);

    // note - if the device is changed to Device, this is also false

    function UnacquiredDevice(transport, descriptor, deviceList) {
        (0, _classCallCheck3.default)(this, UnacquiredDevice);

        var _this = (0, _possibleConstructorReturn3.default)(this, _EventEmitter.call(this));

        _this.connected = true;
        _this.connectEvent = new _FlowEvents.Event1('connect', _this);
        _this.disconnectEvent = new _FlowEvents.Event0('disconnect', _this);

        _this.transport = transport;
        _this.originalDescriptor = descriptor;
        _this.deviceList = deviceList;
        _this._watch();
        return _this;
    }

    UnacquiredDevice.prototype._watchConnectDisconnect = function _watchConnectDisconnect(onConnect, onDisconnect) {
        var _this2 = this;

        var _disconnectListener = function disconnectListener(dev) {};
        var connectListener = function connectListener(device, unacquiredDevice) {
            if (_this2 === unacquiredDevice) {
                _this2.deviceList.connectEvent.removeListener(connectListener);
                _this2.deviceList.disconnectUnacquiredEvent.removeListener(_disconnectListener);
                onConnect(device);
            }
        };
        _disconnectListener = function disconnectListener(unacquiredDevice) {
            if (_this2 === unacquiredDevice) {
                _this2.deviceList.connectEvent.removeListener(connectListener);
                _this2.deviceList.disconnectUnacquiredEvent.removeListener(_disconnectListener);
                onDisconnect();
            }
        };
        this.deviceList.onUnacquiredConnect(this, connectListener);
        this.deviceList.onUnacquiredDisconnect(this, _disconnectListener);
    };

    // returns Promise just to be similar to Device.fromPath


    UnacquiredDevice.fromDescriptor = function fromDescriptor(transport, descriptor, deviceList) {
        return Promise.resolve(new UnacquiredDevice(transport, descriptor, deviceList));
    };

    // what steal() does is that it does not actually keep the session for itself
    // because it immediately releases it again;
    // however, it might stop some other process in another app,
    // so the device will become "usable".
    // This function actually returns the new Device object


    UnacquiredDevice.prototype.steal = function steal() {
        var _this3 = this;

        // I will simultaniously run initialization and wait for devicelist to return device to me
        var result = new Promise(function (resolve, reject) {
            _this3._watchConnectDisconnect(function (device) {
                return resolve(device);
            }, function () {
                return reject(new Error('Device disconnected before grabbing'));
            });
        });
        var currentSession = this.deviceList.getSession(this.originalDescriptor.path);
        var descriptor = (0, _extends3.default)({}, this.originalDescriptor, { session: currentSession });

        // if the run fails, I want to return that error, I guess
        var aggressiveRunResult = _Device2.default._run(function () {
            return true;
        }, this.transport, descriptor, this.deviceList);
        return aggressiveRunResult.then(function () {
            return result;
        });
    };

    UnacquiredDevice.prototype._watch = function _watch() {
        var _this4 = this;

        this._watchConnectDisconnect(function (device) {
            _this4.connected = false;
            _this4.connectEvent.emit(device);
        }, function () {
            _this4.connected = false;
            _this4.disconnectEvent.emit();
        });
    };

    return UnacquiredDevice;
}(_EventEmitter3.default);

exports.default = UnacquiredDevice;