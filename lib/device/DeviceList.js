'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _EventEmitter2 = require('../events/EventEmitter');

var _EventEmitter3 = _interopRequireDefault(_EventEmitter2);

var _FlowEvents = require('../events/FlowEvents');

var _DescriptorStream = require('../utils/DescriptorStream');

var _DescriptorStream2 = _interopRequireDefault(_DescriptorStream);

var _Device = require('./Device');

var _Device2 = _interopRequireDefault(_Device);

var _UnacquiredDevice = require('./UnacquiredDevice');

var _UnacquiredDevice2 = _interopRequireDefault(_UnacquiredDevice);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CONFIG_URL = 'https://wallet.trezor.io/data/config_signed.bin';

// a slight hack
// this error string is hard-coded
// in both bridge and extension
var WRONG_PREVIOUS_SESSION_ERROR_MESSAGE = 'wrong previous session';

//
// Events:
//
//  connect: Device
//  disconnect: Device
//  transport: Transport
//  stream: DescriptorStream
//

var DeviceList = function (_EventEmitter) {
    (0, _inherits3.default)(DeviceList, _EventEmitter);

    DeviceList._setFetch = function _setFetch(fetch) {
        DeviceList._fetch = fetch;
    };

    DeviceList._setTransport = function _setTransport(t) {
        DeviceList.defaultTransport = t;
    };

    function DeviceList(options) {
        (0, _classCallCheck3.default)(this, DeviceList);

        var _this = (0, _possibleConstructorReturn3.default)(this, _EventEmitter.call(this));

        _this.transportLoading = true;
        _this.stream = null;
        _this.devices = {};
        _this.unacquiredDevices = {};
        _this.creatingDevices = {};
        _this.sessions = {};
        _this.errorEvent = new _FlowEvents.Event1('error', _this);
        _this.transportEvent = new _FlowEvents.Event1('transport', _this);
        _this.streamEvent = new _FlowEvents.Event1('stream', _this);
        _this.connectEvent = new _FlowEvents.Event2('connect', _this);
        _this.connectUnacquiredEvent = new _FlowEvents.Event1('connectUnacquired', _this);
        _this.changedSessionsEvent = new _FlowEvents.Event1('changedSessions', _this);
        _this.acquiredEvent = new _FlowEvents.Event1('acquired', _this);
        _this.releasedEvent = new _FlowEvents.Event1('released', _this);
        _this.disconnectEvent = new _FlowEvents.Event1('disconnect', _this);
        _this.disconnectUnacquiredEvent = new _FlowEvents.Event1('disconnectUnacquired', _this);
        _this.updateEvent = new _FlowEvents.Event1('update', _this);


        _this.options = options || {};
        _this.requestNeeded = false;

        _this.transportEvent.on(function (transport) {
            _this.transport = transport;
            _this.transportLoading = false;
            _this.requestNeeded = transport.requestNeeded;

            _this._initStream(transport);
        });

        _this.streamEvent.on(function (stream) {
            _this.stream = stream;
        });

        // using setTimeout to emit 'transport' in next tick,
        // so people from outside can add listener after constructor finishes
        setTimeout(function () {
            return _this._initTransport();
        }, 0);
        return _this;
    }

    DeviceList.prototype.requestDevice = function requestDevice() {
        if (this.transport == null) {
            return Promise.reject();
        }
        return this.transport.requestDevice();
    };

    DeviceList.prototype.asArray = function asArray() {
        return objectValues(this.devices);
    };

    DeviceList.prototype.unacquiredAsArray = function unacquiredAsArray() {
        return objectValues(this.unacquiredDevices);
    };

    DeviceList.prototype.hasDeviceOrUnacquiredDevice = function hasDeviceOrUnacquiredDevice() {
        return this.asArray().length + this.unacquiredAsArray().length > 0;
    };

    // for mytrezor - returns "bridge" or "extension", or something else :)


    DeviceList.prototype.transportType = function transportType() {
        if (this.transport == null) {
            return '';
        }
        if (this.transport.activeName) {
            // $FlowIssue
            var activeName = this.transport.activeName;
            if (activeName === 'BridgeTransport') {
                return 'bridge';
            }
            if (activeName === 'ExtensionTransport') {
                return 'extension';
            }
            return activeName;
        }
        return this.transport.name;
    };

    DeviceList.prototype.transportVersion = function transportVersion() {
        if (this.transport == null) {
            return '';
        }
        return this.transport.version;
    };

    DeviceList.prototype.transportOutdated = function transportOutdated() {
        if (this.transport == null) {
            return false;
        }
        if (this.transport.isOutdated) {
            return true;
        }
        return false;
    };

    DeviceList.prototype._configTransport = function _configTransport(transport) {
        if (this.options.config != null) {
            return transport.configure(this.options.config);
        } else {
            var _configUrl = this.options.configUrl == null ? CONFIG_URL + '?' + Date.now() : this.options.configUrl;
            var fetch = DeviceList._fetch;
            return fetch(_configUrl).then(function (response) {
                if (!response.ok) {
                    throw new Error('Wrong config response.');
                }
                return response.text();
            }).then(function (config) {
                return transport.configure(config);
            });
        }
    };

    DeviceList.prototype._initTransport = function _initTransport() {
        var _this2 = this;

        var transport = this.options.transport ? this.options.transport : DeviceList.defaultTransport();
        if (this.options.debugInfo) {
            console.log('[trezor.js] [device list] Initializing transports');
        }
        transport.init(this.options.debug).then(function () {
            if (_this2.options.debugInfo) {
                console.log('[trezor.js] [device list] Configuring transports');
            }
            _this2._configTransport(transport).then(function () {
                if (_this2.options.debugInfo) {
                    console.log('[trezor.js] [device list] Configuring transports done');
                }
                _this2.transportEvent.emit(transport);
            });
        }, function (error) {
            if (_this2.options.debugInfo) {
                console.error('[trezor.js] [device list] Error in transport', error);
            }
            _this2.errorEvent.emit(error);
        });
    };

    DeviceList.prototype._createAndSaveDevice = function _createAndSaveDevice(transport, descriptor, stream, previous) {
        var _this3 = this;

        if (this.options.debugInfo) {
            console.log('[trezor.js] [device list] Creating Device', descriptor, previous);
        }

        var path = descriptor.path.toString();
        this.creatingDevices[path] = true;
        this._createDevice(transport, descriptor, stream, previous).then(function (device) {
            if (device instanceof _Device2.default) {
                _this3.devices[path] = device;
                delete _this3.creatingDevices[path];
                _this3.connectEvent.emit(device, previous);
            } else {
                delete _this3.creatingDevices[path];
                _this3.unacquiredDevices[path] = device;
                _this3.connectUnacquiredEvent.emit(device);
            }
        }).catch(function (err) {
            console.debug('[trezor.js] [device list] Cannot create device', err);
        });
    };

    DeviceList.prototype._createDevice = function _createDevice(transport, descriptor, stream, previous) {
        var _this4 = this;

        var devRes = _Device2.default.fromDescriptor(transport, descriptor, this).then(function (device) {
            return device;
        }).catch(function (error) {
            if (error.message === WRONG_PREVIOUS_SESSION_ERROR_MESSAGE) {
                if (previous == null) {
                    return _this4._createUnacquiredDevice(transport, descriptor, stream);
                } else {
                    _this4.unacquiredDevices[previous.originalDescriptor.path.toString()] = previous;
                    return previous;
                }
            }
            _this4.errorEvent.emit(error);
            throw error;
        });
        return devRes;
    };

    DeviceList.prototype._createUnacquiredDevice = function _createUnacquiredDevice(transport, descriptor, stream) {
        var _this5 = this;

        if (this.options.debugInfo) {
            console.log('[trezor.js] [device list] Creating Unacquired Device', descriptor);
        }

        // if (this.getSession(descriptor.path) == null) {
        //     return Promise.reject("Device no longer connected.");
        // }
        var res = _UnacquiredDevice2.default.fromDescriptor(transport, descriptor, this).then(function (device) {
            return device;
        }).catch(function (error) {
            _this5.errorEvent.emit(error);
        });
        return res;
    };

    DeviceList.prototype.getSession = function getSession(path) {
        return this.sessions[path];
    };

    DeviceList.prototype.setHard = function setHard(path, session) {
        if (this.stream != null) {
            this.stream.setHard(path, session);
        }
        this.sessions[path] = session;
    };

    DeviceList.prototype._initStream = function _initStream(transport) {
        var _this6 = this;

        var stream = new _DescriptorStream2.default(transport);

        stream.updateEvent.on(function (diff) {
            _this6.sessions = {};
            diff.descriptors.forEach(function (descriptor) {
                _this6.sessions[descriptor.path.toString()] = descriptor.session;
            });

            diff.connected.forEach(function (descriptor) {
                var path = descriptor.path;

                // if descriptor is null => we can acquire the device
                if (descriptor.session == null) {
                    _this6._createAndSaveDevice(transport, descriptor, stream);
                } else {
                    _this6.creatingDevices[path.toString()] = true;
                    _this6._createUnacquiredDevice(transport, descriptor, stream).then(function (device) {
                        _this6.unacquiredDevices[path.toString()] = device;
                        delete _this6.creatingDevices[path.toString()];
                        _this6.connectUnacquiredEvent.emit(device);
                    });
                }
            });

            var events = [{
                d: diff.changedSessions,
                e: _this6.changedSessionsEvent
            }, {
                d: diff.acquired,
                e: _this6.acquiredEvent
            }, {
                d: diff.released,
                e: _this6.releasedEvent
            }];

            events.forEach(function (_ref) {
                var d = _ref.d,
                    e = _ref.e;

                d.forEach(function (descriptor) {
                    var pathStr = descriptor.path.toString();
                    var device = _this6.devices[pathStr];
                    if (device != null) {
                        e.emit(device);
                    }
                });
            });

            diff.disconnected.forEach(function (descriptor) {
                var path = descriptor.path;
                var pathStr = path.toString();
                var device = _this6.devices[pathStr];
                if (device != null) {
                    delete _this6.devices[pathStr];
                    _this6.disconnectEvent.emit(device);
                }

                var unacquiredDevice = _this6.unacquiredDevices[pathStr];
                if (unacquiredDevice != null) {
                    delete _this6.unacquiredDevices[pathStr];
                    _this6.disconnectUnacquiredEvent.emit(unacquiredDevice);
                }
            });

            diff.released.forEach(function (descriptor) {
                var path = descriptor.path;
                var device = _this6.unacquiredDevices[path.toString()];

                if (device != null) {
                    var previous = _this6.unacquiredDevices[path.toString()];
                    delete _this6.unacquiredDevices[path.toString()];
                    _this6._createAndSaveDevice(transport, descriptor, stream, previous);
                }
            });

            _this6.updateEvent.emit(diff);
        });

        stream.errorEvent.on(function (error) {
            _this6.errorEvent.emit(error);
            stream.stop();
        });

        stream.listen();

        this.streamEvent.emit(stream);
    };

    DeviceList.prototype.onUnacquiredConnect = function onUnacquiredConnect(unacquiredDevice, listener) {
        var path = unacquiredDevice.originalDescriptor.path.toString();
        if (this.unacquiredDevices[path] == null) {
            if (this.creatingDevices[path] != null) {
                this.connectEvent.on(listener);
            } else if (this.devices[path] != null) {
                listener(this.devices[path], unacquiredDevice);
            }
        } else {
            this.connectEvent.on(listener);
        }
    };

    DeviceList.prototype.onUnacquiredDisconnect = function onUnacquiredDisconnect(unacquiredDevice, listener) {
        var path = unacquiredDevice.originalDescriptor.path.toString();
        if (this.unacquiredDevices[path] == null) {
            if (this.creatingDevices[path] != null) {
                this.disconnectUnacquiredEvent.on(listener);
            } else if (this.devices[path] == null) {
                listener(unacquiredDevice);
            }
        } else {
            this.disconnectUnacquiredEvent.on(listener);
        }
    };

    DeviceList.prototype.onDisconnect = function onDisconnect(device, listener) {
        var path = device.originalDescriptor.path.toString();
        if (this.devices[path] == null && this.creatingDevices[path] == null) {
            listener(device);
        } else {
            this.disconnectEvent.on(listener);
        }
    };

    // If there is at least one physical device connected, returns it, steals it if necessary


    DeviceList.prototype.stealFirstDevice = function stealFirstDevice(rejectOnEmpty) {
        var _this7 = this;

        var devices = this.asArray();
        if (devices.length > 0) {
            return Promise.resolve(devices[0]);
        }
        var unacquiredDevices = this.unacquiredAsArray();
        if (unacquiredDevices.length > 0) {
            return unacquiredDevices[0].steal();
        }
        if (rejectOnEmpty) {
            return Promise.reject(new Error('No device connected'));
        } else {
            return new Promise(function (resolve, reject) {
                _this7.connectEvent.once(function () {
                    _this7.stealFirstDevice().then(function (d) {
                        return resolve(d);
                    }, function (e) {
                        return reject(e);
                    });
                });
            });
        }
    };

    // steals the first devices, acquires it and *never* releases it until the window is closed


    DeviceList.prototype.acquireFirstDevice = function acquireFirstDevice(rejectOnEmpty) {
        var _this8 = this;

        var timeoutPromiseFn = function timeoutPromiseFn(t) {
            return new Promise(function (resolve) {
                setTimeout(function () {
                    return resolve();
                }, t);
            });
        };

        return new Promise(function (resolve, reject) {
            _this8.stealFirstDevice(rejectOnEmpty).then(function (device) {
                device.run(function (session) {
                    resolve({ device: device, session: session });
                    // this "inside" promise never resolves or rejects
                    return new Promise(function (resolve, reject) {});
                });
            }, function (err) {
                reject(err);
            });
        }).catch(function (err) {
            if (err.message === WRONG_PREVIOUS_SESSION_ERROR_MESSAGE) {
                return timeoutPromiseFn(1000).then(function () {
                    return _this8.acquireFirstDevice(rejectOnEmpty);
                });
            }
            throw err;
        });
    };

    DeviceList.prototype.onbeforeunload = function onbeforeunload(clearSession) {
        this.asArray().forEach(function (device) {
            return device.onbeforeunload(clearSession);
        });
    };

    return DeviceList;
}(_EventEmitter3.default);

DeviceList._fetch = function () {
    return Promise.reject(new Error('No fetch defined'));
};

exports.default = DeviceList;


function objectValues(object) {
    return Object.keys(object).map(function (key) {
        return object[key];
    });
}