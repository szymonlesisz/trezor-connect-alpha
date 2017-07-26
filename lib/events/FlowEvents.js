

// Simple wrapper for typechecking events
// see: https://github.com/runn1ng/flow-events
'use strict';

exports.__esModule = true;
exports.Event2 = exports.Event1 = exports.Event0 = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var events = require('events');
var EventEmitter = events.EventEmitter;

var Event0 = exports.Event0 = function () {
    function Event0(type, parent) {
        (0, _classCallCheck3.default)(this, Event0);

        this.type = type;
        this.parent = parent;
    }

    Event0.prototype.on = function on(listener) {
        this.parent.on(this.type, listener);
    };

    Event0.prototype.once = function once(listener) {
        this.parent.once(this.type, listener);
    };

    Event0.prototype.removeListener = function removeListener(listener) {
        this.parent.removeListener(this.type, listener);
    };

    Event0.prototype.removeAllListeners = function removeAllListeners() {
        this.parent.removeAllListeners(this.type);
    };

    Event0.prototype.emit = function emit() {
        return this.parent.emit(this.type);
    };

    Event0.prototype.listenerCount = function listenerCount() {
        return this.parent.listenerCount(this.type);
    };

    return Event0;
}();

var Event1 = exports.Event1 = function () {
    function Event1(type, parent) {
        (0, _classCallCheck3.default)(this, Event1);

        this.type = type;
        this.parent = parent;
    }

    Event1.prototype.on = function on(listener) {
        this.parent.on(this.type, listener);
    };

    Event1.prototype.once = function once(listener) {
        this.parent.once(this.type, listener);
    };

    Event1.prototype.removeListener = function removeListener(listener) {
        this.parent.removeListener(this.type, listener);
    };

    Event1.prototype.removeAllListeners = function removeAllListeners() {
        this.parent.removeAllListeners(this.type);
    };

    Event1.prototype.emit = function emit(arg1) {
        return this.parent.emit(this.type, arg1);
    };

    Event1.prototype.listenerCount = function listenerCount() {
        return this.parent.listenerCount(this.type);
    };

    return Event1;
}();

var Event2 = exports.Event2 = function () {
    function Event2(type, parent) {
        (0, _classCallCheck3.default)(this, Event2);

        this.type = type;
        this.parent = parent;
    }

    Event2.prototype.on = function on(listener) {
        this.parent.on(this.type, listener);
    };

    Event2.prototype.once = function once(listener) {
        this.parent.once(this.type, listener);
    };

    Event2.prototype.removeListener = function removeListener(listener) {
        this.parent.removeListener(this.type, listener);
    };

    Event2.prototype.removeAllListeners = function removeAllListeners() {
        this.parent.removeAllListeners(this.type);
    };

    Event2.prototype.emit = function emit(arg1, arg2) {
        return this.parent.emit(this.type, arg1, arg2);
    };

    Event2.prototype.listenerCount = function listenerCount() {
        return this.parent.listenerCount(this.type);
    };

    return Event2;
}();