'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _Popup = require('./containers/Popup');

var _Popup2 = _interopRequireDefault(_Popup);

var _Modal = require('./containers/Modal');

var _Modal2 = _interopRequireDefault(_Modal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Deprecated: wrapper class which decides what kind of UI will be used (Modal or Popup)
 */
var ViewManager = function () {
  function ViewManager() {
    (0, _classCallCheck3.default)(this, ViewManager);
  }

  /**
   * Method call
   * Open proper container and pass arguments
   * @param {Object} args
   * @returns {Promise.<Object>}
   */
  ViewManager.call = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(args) {
      var container, p;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              container = args.container;
              p = container === 'popup' ? new _Popup2.default() : new _Modal2.default();
              _context.next = 4;
              return p.open(args);

            case 4:
              return _context.abrupt('return', _context.sent);

            case 5:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function call(_x) {
      return _ref.apply(this, arguments);
    }

    return call;
  }();

  return ViewManager;
}();

exports.default = ViewManager;
;