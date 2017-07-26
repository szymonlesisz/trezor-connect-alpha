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

var _EventEmitter2 = require('../events/EventEmitter');

var _EventEmitter3 = _interopRequireDefault(_EventEmitter2);

var _FlowEvents = require('../events/FlowEvents');

var _connectionLock = require('./connectionLock');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DescriptorStream = function (_EventEmitter) {
    (0, _inherits3.default)(DescriptorStream, _EventEmitter);

    function DescriptorStream(transport) {
        (0, _classCallCheck3.default)(this, DescriptorStream);

        var _this = (0, _possibleConstructorReturn3.default)(this, _EventEmitter.call(this));

        _this.listening = false;
        _this.previous = null;
        _this.current = [];
        _this.errorEvent = new _FlowEvents.Event1('error', _this);
        _this.connectEvent = new _FlowEvents.Event1('connect', _this);
        _this.disconnectEvent = new _FlowEvents.Event1('disconnect', _this);
        _this.acquiredEvent = new _FlowEvents.Event1('acquired', _this);
        _this.releasedEvent = new _FlowEvents.Event1('released', _this);
        _this.changedSessionsEvent = new _FlowEvents.Event1('changedSessions', _this);
        _this.updateEvent = new _FlowEvents.Event1('update', _this);

        _this.transport = transport;
        return _this;
    }

    DescriptorStream.prototype.setHard = function setHard(path, session) {
        if (this.previous != null) {
            var copy = this.previous.map(function (d) {
                if (d.path === path) {
                    return (0, _extends3.default)({}, d, { session: session });
                } else {
                    return d;
                }
            });
            this.current = copy;
            this._reportChanges();
        }
    };

    DescriptorStream.prototype.listen = function listen() {
        var _this2 = this;

        // if we are not enumerating for the first time, we can let
        // the transport to block until something happens
        var waitForEvent = this.previous !== null;

        this.listening = true;
        var previous = this.previous || [];
        var promise = waitForEvent ? this.transport.listen(previous) : this.transport.enumerate();
        promise.then(function (descriptors) {
            if (!_this2.listening) {
                // do not continue if stop() was called
                return;
            }

            _this2.current = descriptors;
            _this2._reportChanges();

            if (_this2.listening) {
                // handlers might have called stop()
                _this2.listen();
            }
            return;
        }).catch(function (error) {
            _this2.errorEvent.emit(error);
        });
    };

    DescriptorStream.prototype.stop = function stop() {
        this.listening = false;
    };

    DescriptorStream.prototype._diff = function _diff(previousN, descriptors) {
        var previous = previousN || [];
        var connected = descriptors.filter(function (d) {
            return previous.find(function (x) {
                return x.path === d.path;
            }) === undefined;
        });
        var disconnected = previous.filter(function (d) {
            return descriptors.find(function (x) {
                return x.path === d.path;
            }) === undefined;
        });
        var changedSessions = descriptors.filter(function (d) {
            var previousDescriptor = previous.find(function (x) {
                return x.path === d.path;
            });
            if (previousDescriptor !== undefined) {
                return previousDescriptor.session !== d.session;
            } else {
                return false;
            }
        });
        var acquired = changedSessions.filter(function (descriptor) {
            return descriptor.session != null;
        });
        var released = changedSessions.filter(function (descriptor) {
            return descriptor.session == null;
        });

        var didUpdate = connected.length + disconnected.length + changedSessions.length > 0;

        return {
            connected: connected,
            disconnected: disconnected,
            changedSessions: changedSessions,
            acquired: acquired,
            released: released,
            didUpdate: didUpdate,
            descriptors: descriptors
        };
    };

    DescriptorStream.prototype._reportChanges = function _reportChanges() {
        var _this3 = this;

        (0, _connectionLock.lock)(function () {
            var diff = _this3._diff(_this3.previous, _this3.current);
            _this3.previous = _this3.current;

            if (diff.didUpdate) {
                diff.connected.forEach(function (d) {
                    _this3.connectEvent.emit(d);
                });
                diff.disconnected.forEach(function (d) {
                    _this3.disconnectEvent.emit(d);
                });
                diff.acquired.forEach(function (d) {
                    _this3.acquiredEvent.emit(d);
                });
                diff.released.forEach(function (d) {
                    _this3.releasedEvent.emit(d);
                });
                diff.changedSessions.forEach(function (d) {
                    _this3.changedSessionsEvent.emit(d);
                });
                _this3.updateEvent.emit(diff);
            }
            return Promise.resolve();
        });
    };

    return DescriptorStream;
}(_EventEmitter3.default);

exports.default = DescriptorStream;