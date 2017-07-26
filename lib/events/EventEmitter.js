'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// avoids a bug in flowtype: https://github.com/facebook/flow/issues/545

var events = require('events');
var EventEmitterOut = events.EventEmitter;

var EventEmitter = function (_EventEmitterOut) {
  (0, _inherits3.default)(EventEmitter, _EventEmitterOut);

  function EventEmitter() {
    (0, _classCallCheck3.default)(this, EventEmitter);
    return (0, _possibleConstructorReturn3.default)(this, _EventEmitterOut.apply(this, arguments));
  }

  return EventEmitter;
}(EventEmitterOut);

exports.default = EventEmitter;