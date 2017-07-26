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

var _semverCompare = require('semver-compare');

var _semverCompare2 = _interopRequireDefault(_semverCompare);

var _windowOrGlobal = require('window-or-global');

var _windowOrGlobal2 = _interopRequireDefault(_windowOrGlobal);

var _EventEmitter2 = require('../events/EventEmitter');

var _EventEmitter3 = _interopRequireDefault(_EventEmitter2);

var _FlowEvents = require('../events/FlowEvents');

var _Session = require('./Session');

var _Session2 = _interopRequireDefault(_Session);

var _connectionLock = require('../utils/connectionLock');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// a slight hack
// this error string is hard-coded
// in both bridge and extension
var WRONG_PREVIOUS_SESSION_ERROR_MESSAGE = 'wrong previous session';

var Device = function (_EventEmitter) {
    (0, _inherits3.default)(Device, _EventEmitter);

    // in miliseconds
    function Device(transport, descriptor, features, deviceList) {
        (0, _classCallCheck3.default)(this, Device);

        // === immutable properties
        var _this = (0, _possibleConstructorReturn3.default)(this, _EventEmitter.call(this));

        _this.activityInProgress = false;
        _this.connected = true;
        _this.clearSession = false;
        _this.clearSessionTime = 10 * 60 * 1000;
        _this.clearSessionTimeout = null;
        _this.clearSessionFuture = 0;
        _this.rememberPlaintextPassphrase = false;
        _this.rememberedPlaintextPasshprase = null;
        _this.disconnectEvent = new _FlowEvents.Event0('disconnect', _this);
        _this.buttonEvent = new _FlowEvents.Event1('button', _this);
        _this.errorEvent = new _FlowEvents.Event1('error', _this);
        _this.passphraseEvent = new _FlowEvents.Event1('passphrase', _this);
        _this.wordEvent = new _FlowEvents.Event1('word', _this);
        _this.changedSessionsEvent = new _FlowEvents.Event2('changedSessions', _this);
        _this.pinEvent = new _FlowEvents.Event2('pin', _this);
        _this.receiveEvent = new _FlowEvents.Event2('receive', _this);
        _this.sendEvent = new _FlowEvents.Event2('send', _this);
        _this._stolenEvent = new _FlowEvents.Event0('stolen', _this);
        _this.transport = transport;
        _this.originalDescriptor = descriptor;
        _this.deviceList = deviceList;

        if (_this.deviceList.options.clearSession) {
            _this.clearSession = true;
            if (_this.deviceList.options.clearSessionTime) {
                _this.clearSessionTime = _this.deviceList.options.clearSessionTime;
            }
        }
        if (_this.deviceList.options.rememberDevicePassphrase) {
            _this.rememberPlaintextPassphrase = true;
        }

        // === mutable properties
        // features get reloaded after every initialization
        _this.features = features;
        _this.connected = true;

        _this._watch();
        return _this;
    }

    // Initializes device with the given descriptor,
    // runs a given function and then releases the session.
    // Return promise with the result of the function.
    // First parameter is a function that has two parameters
    // - first the session and second the fresh device features.
    // Note - when descriptor.path != null, this will steal the device from someone else


    Device._run = function _run(fn, transport, descriptor, deviceList, onAcquire, onRelease) {
        return Device._acquire(transport, descriptor, deviceList, onAcquire).then(function (session) {
            return promiseFinally(session.initialize().then(function (res) {
                return fn(session, res.message);
            }), function () {
                return Device._release(descriptor, session, deviceList, onRelease);
            });
        });
    };

    // Release and acquire are quite complex,
    // because we have to deal with various race conditions
    // for multitasking


    Device._release = function _release(originalDescriptor, session, deviceList, onRelease) {
        var released = (0, _connectionLock.lock)(function () {
            return promiseFinally(session.release(), function (res, error) {
                if (error == null) {
                    deviceList.setHard(originalDescriptor.path, null);
                }
                return Promise.resolve();
            });
        });
        return promiseFinally(released, function (res, error) {
            if (onRelease != null) {
                return onRelease(error);
            }
            return Promise.resolve();
        });
    };

    Device._acquire = function _acquire(transport, descriptor, deviceList, onAcquire) {
        return (0, _connectionLock.lock)(function () {
            return transport.acquire({
                path: descriptor.path,
                previous: descriptor.session,
                checkPrevious: true
            }).then(function (res) {
                deviceList.setHard(descriptor.path, res);
                return res;
            });
        }).then(function (result) {
            var session = new _Session2.default(transport, result, descriptor, !!deviceList.options.debugInfo);
            if (onAcquire != null) {
                onAcquire(session);
            }
            return session;
        });
    };

    Device.prototype.waitForSessionAndRun = function waitForSessionAndRun(fn, options) {
        var options_ = options == null ? {} : options;
        return this.run(fn, (0, _extends3.default)({}, options_, { waiting: true }));
    };

    Device.prototype.runAggressive = function runAggressive(fn, options) {
        var options_ = options == null ? {} : options;
        return this.run(fn, (0, _extends3.default)({}, options_, { aggressive: true }));
    };

    // Initializes device with the given descriptor,
    // runs a given function and then releases the session.
    // Return promise with the result of the function.
    // First parameter is a function that has session as a parameter


    Device.prototype.run = function run(fn, options) {
        var _this2 = this;

        if (!this.connected) {
            return Promise.reject(new Error('Device disconnected.'));
        }
        var options_ = options == null ? {} : options;
        var aggressive = !!options_.aggressive;
        var skipFinalReload = !!options_.skipFinalReload;
        var waiting = !!options_.waiting;

        var onlyOneActivity = !!options_.onlyOneActivity;
        if (onlyOneActivity && this.activityInProgress) {
            return Promise.reject(new Error('One activity already running.'));
        }

        this.activityInProgress = true;
        this._stopClearSessionTimeout();

        var currentSession = this.deviceList.getSession(this.originalDescriptor.path);
        if (!aggressive && !waiting && currentSession != null) {
            return Promise.reject(new Error('Device used in another window.'));
        }
        if (aggressive && waiting) {
            return Promise.reject(new Error('Combination of aggressive and waiting doesn\'t make sense.'));
        }

        var waitingPromise = Promise.resolve(currentSession);
        if (waiting && currentSession != null) {
            waitingPromise = this._waitForNullSession();
        }

        var runFinal = function runFinal(res, error) {
            if (!(error && error.message === WRONG_PREVIOUS_SESSION_ERROR_MESSAGE && waiting)) {
                if (_this2.clearSession) {
                    _this2._startClearSessionTimeout();
                }
            }
            return Promise.resolve();
        };

        return waitingPromise.then(function (resolvedSession) {
            var descriptor = (0, _extends3.default)({}, _this2.originalDescriptor, { session: resolvedSession });

            // This is a bit overengineered, but I am not sure how to do it otherwise
            // I want the action to stop when the device is stolen,
            // but I don't want to add listener events that are never removed...
            // So I combine emitters and promises
            // Szymon: this needs to be fixed,
            // this._stolenEvent needs to remove all of his listeneres when Session is released
            var e = new _EventEmitter3.default();
            var stolenP = new Promise(function (resolve, reject) {
                var onceStolen = function onceStolen() {
                    e.removeAllListeners();
                    reject(new Error('The action was interrupted by another application.'));
                };
                _this2._stolenEvent.once(onceStolen);
                e.once('done', function () {
                    _this2._stolenEvent.removeListener(onceStolen);
                    resolve();
                });
            });

            var res = Device._run(function (session, features) {
                return _this2._runInside(fn, session, features, skipFinalReload);
            }, _this2.transport, descriptor, _this2.deviceList, function (session) {
                _this2.currentSessionObject = session;
            }, function (error) {
                _this2.currentSessionObject = null;
                _this2.activityInProgress = false;
                if (error != null && _this2.connected) {
                    if (error.message === 'Action was interrupted.') {
                        _this2._stolenEvent.emit();
                        return Promise.resolve();
                    } else {
                        return new Promise(function (resolve, reject) {
                            var onDisconnect = function onDisconnect() {};
                            var onChanged = function onChanged() {
                                if (_this2.isStolen()) {
                                    _this2._stolenEvent.emit();
                                }
                                _this2.disconnectEvent.removeListener(onDisconnect);
                                resolve();
                            };
                            onDisconnect = function onDisconnect() {
                                _this2.changedSessionsEvent.removeListener(onChanged);
                                resolve();
                            };
                            _this2.changedSessionsEvent.once(onChanged);
                            _this2.disconnectEvent.once(onDisconnect);
                        });
                    }
                } else {
                    return Promise.resolve();
                }
            });

            return promiseFinally(Promise.all([promiseFinally(res, function (ok, err) {
                e.emit('done');
                return Promise.resolve();
            }), stolenP]).then(function () {
                return res;
            }), function (res, error) {
                return runFinal(res, error);
            }).catch(function (error) {
                if (!_this2.connected) {
                    throw new Error('Device was disconnected during action.');
                }
                if (error.message === WRONG_PREVIOUS_SESSION_ERROR_MESSAGE && waiting) {
                    // trying again!!!
                    return _this2._waitForNullSession().then(function () {
                        return _this2.run(fn, options);
                    });
                } else {
                    throw error;
                }
            });
        });
    };

    Device.prototype._reloadFeaturesOrInitialize = function _reloadFeaturesOrInitialize(session) {
        var _this3 = this;

        var featuresPromise = void 0;
        if (this.atLeast('1.3.3')) {
            featuresPromise = session.getFeatures();
        } else {
            featuresPromise = session.initialize();
        }
        return featuresPromise.then(function (res) {
            _this3.features = res.message;
            return;
        });
    };

    Device.prototype._startClearSessionTimeout = function _startClearSessionTimeout() {
        var _this4 = this;

        if (this.features.bootloader_mode) {
            return;
        }
        this.clearSessionTimeout = _windowOrGlobal2.default.setTimeout(function () {
            var options = { onlyOneActivity: true };
            _this4.run(function (session) {
                return session.clearSession();
            }, options);

            _this4.clearSessionTimeout = null;
        }, this.clearSessionTime);
        this.clearSessionFuture = Date.now() + this.clearSessionTime;
    };

    Device.prototype.clearSessionRest = function clearSessionRest() {
        if (this.clearSessionTimeout == null) {
            return 0;
        } else {
            return this.clearSessionFuture - Date.now();
        }
    };

    Device.prototype._stopClearSessionTimeout = function _stopClearSessionTimeout() {
        if (this.clearSessionTimeout != null) {
            _windowOrGlobal2.default.clearTimeout(this.clearSessionTimeout);
            this.clearSessionTimeout = null;
        }
    };

    Device.prototype.forwardPassphrase = function forwardPassphrase(source) {
        var _this5 = this;

        source.on(function (arg) {
            if (_this5.rememberedPlaintextPasshprase != null) {
                var p = _this5.rememberedPlaintextPasshprase;
                arg(null, p);
                return;
            }

            var argAndRemember = function argAndRemember(e, passphrase) {
                if (_this5.rememberPlaintextPassphrase) {
                    _this5.rememberedPlaintextPasshprase = passphrase;
                }
                arg(e, passphrase);
            };
            _this5.passphraseEvent.emit(argAndRemember);
        });
    };

    Device.prototype._runInside = function _runInside(fn, activeSession, features, skipFinalReload) {
        var _this6 = this;

        this.features = features;

        forward2(activeSession.sendEvent, this.sendEvent);
        forward2(activeSession.receiveEvent, this.receiveEvent);
        forwardError(activeSession.errorEvent, this.errorEvent);

        forward1(activeSession.buttonEvent, this.buttonEvent);
        forwardCallback2(activeSession.pinEvent, this.pinEvent);
        forwardCallback1(activeSession.wordEvent, this.wordEvent);
        this.forwardPassphrase(activeSession.passphraseEvent);

        var runFinal = function runFinal() {
            activeSession.deactivateEvents();

            if (skipFinalReload) {
                return Promise.resolve();
            } else {
                return _this6._reloadFeaturesOrInitialize(activeSession);
            }
        };

        return promiseFinally(Promise.resolve(fn(activeSession)), function () {
            return runFinal();
        });
    };

    Device.prototype._waitForNullSession = function _waitForNullSession() {
        var _this7 = this;

        return new Promise(function (resolve, reject) {
            var _onDisconnect = function onDisconnect() {};
            var onUpdate = function onUpdate() {
                var updatedSession = _this7.deviceList.getSession(_this7.originalDescriptor.path);
                var device = _this7.deviceList.devices[_this7.originalDescriptor.path.toString()];
                if (updatedSession == null && device != null) {
                    _this7.deviceList.disconnectEvent.removeListener(_onDisconnect);
                    _this7.deviceList.updateEvent.removeListener(onUpdate);
                    resolve(updatedSession);
                }
            };
            _onDisconnect = function onDisconnect(device) {
                if (device === _this7) {
                    _this7.deviceList.disconnectEvent.removeListener(_onDisconnect);
                    _this7.deviceList.updateEvent.removeListener(onUpdate);
                    reject(new Error('Device disconnected'));
                }
            };
            onUpdate();
            _this7.deviceList.updateEvent.on(onUpdate);
            _this7.deviceList.onDisconnect(_this7, _onDisconnect);
        });
    };

    Device.fromDescriptor = function fromDescriptor(transport, originalDescriptor, deviceList) {
        // at this point I am assuming nobody else has the device
        var descriptor = (0, _extends3.default)({}, originalDescriptor, { session: null });
        return Device._run(function (session, features) {
            return new Device(transport, descriptor, features, deviceList);
        }, transport, descriptor, deviceList);
    };

    Device.prototype.reloadFeatures = function reloadFeatures() {
        return this.run(function () {
            return true;
        });
    };

    // what steal() does is that it does not actually keep the session for itself
    // because it immediately releases it again;
    // however, it might stop some other process in another app,
    // so the device will become "usable"


    Device.prototype.steal = function steal() {
        return this.run(function () {
            return true;
        }, { aggressive: true });
    };

    Device.prototype.isBootloader = function isBootloader() {
        return this.features.bootloader_mode;
    };

    Device.prototype.isInitialized = function isInitialized() {
        return this.features.initialized;
    };

    Device.prototype.getVersion = function getVersion() {
        return [this.features.major_version, this.features.minor_version, this.features.patch_version].join('.');
    };

    Device.prototype.atLeast = function atLeast(version) {
        return (0, _semverCompare2.default)(this.getVersion(), version) >= 0;
    };

    Device.prototype.getCoin = function getCoin(name) {
        var coins = this.features.coins;

        for (var i = 0; i < coins.length; i++) {
            if (coins[i].coin_name === name) {
                return coins[i];
            }
        }
        throw new Error('Device does not support given coin type');
    };

    Device.prototype._watch = function _watch() {
        var _this8 = this;

        var onChangedSessions = function onChangedSessions(device) {
            if (device === _this8) {
                _this8.changedSessionsEvent.emit(_this8.isUsed(), _this8.isUsedHere());
                if (_this8.isStolen() && _this8.currentSessionObject != null) {
                    _this8._stolenEvent.emit();
                }
            }
        };
        var onDisconnect = function onDisconnect(device) {
            if (device === _this8) {
                _this8.disconnectEvent.emit();
                _this8.deviceList.disconnectEvent.removeListener(onDisconnect);
                _this8.deviceList.changedSessionsEvent.removeListener(onChangedSessions);
                _this8.connected = false;

                var events = [_this8.changedSessionsEvent, _this8.sendEvent, _this8.receiveEvent, _this8.errorEvent, _this8.buttonEvent, _this8.pinEvent, _this8.wordEvent];
                events.forEach(function (ev) {
                    return ev.removeAllListeners();
                });
            }
        };
        onChangedSessions(this);
        this.deviceList.changedSessionsEvent.on(onChangedSessions);
        this.deviceList.onDisconnect(this, onDisconnect);
    };

    Device.prototype.isUsed = function isUsed() {
        var session = this.deviceList.getSession(this.originalDescriptor.path);
        return session != null;
    };

    Device.prototype.isUsedHere = function isUsedHere() {
        var session = this.deviceList.getSession(this.originalDescriptor.path);
        var mySession = this.currentSessionObject != null ? this.currentSessionObject.getId() : null;
        return session != null && mySession === session;
    };

    Device.prototype.isUsedElsewhere = function isUsedElsewhere() {
        return this.isUsed() && !this.isUsedHere();
    };

    Device.prototype.isStolen = function isStolen() {
        var shouldBeUsedHere = this.currentSessionObject != null;

        if (this.isUsed()) {
            if (shouldBeUsedHere) {
                // is used and should be used here => returns true if it's used elsewhere
                return this.isUsedElsewhere();
            } else {
                // is used and should not be used => returns true
                return true;
            }
        } else {
            if (shouldBeUsedHere) {
                // isn't used and should be used => stolen (??)
                return true;
            } else {
                // isn't used and shouldn't be used => nothing
                return false;
            }
        }
    };

    Device.prototype.onbeforeunload = function onbeforeunload() {
        // Szymon tmp fix
        this.release();

        var currentSession = this.currentSessionObject;
        if (currentSession != null) {
            // cannot run .then() in browser; so let's just fire and hope for the best
            if (this.clearSession) {
                currentSession.clearSession();
            }
            currentSession.release();
        }
    };

    Device.prototype.release = function release() {
        // Szymon tmp fix
        this._stolenEvent.removeAllListeners();
    };

    return Device;
}(_EventEmitter3.default);

// Forwards events from source to target

exports.default = Device;
function forwardError(source, target) {
    source.on(function (arg) {
        if (target.listenerCount() === 0) {
            return;
        }
        target.emit(arg);
    });
}

function forwardCallback1(source, target) {
    source.on(function (arg) {
        target.emit(arg);
    });
}

function forwardCallback2(source, target) {
    source.on(function (arg, arg2) {
        target.emit(arg, arg2);
    });
}

function forward1(source, target) {
    source.on(function (arg) {
        target.emit(arg);
    });
}

function forward2(source, target) {
    source.on(function (arg1, arg2) {
        target.emit(arg1, arg2);
    });
}

function promiseFinally(p, fun) {
    return p.then(function (res) {
        return fun(res, null).then(function () {
            return res;
        });
    }, function (err) {
        return fun(null, err).then(function () {
            throw err;
        }, function () {
            throw err;
        });
    });
}