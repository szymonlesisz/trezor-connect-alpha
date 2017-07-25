'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _preact = require('preact');

var _ContainerComponent = require('./ContainerComponent');

var _ContainerComponent2 = _interopRequireDefault(_ContainerComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var DeviceInstructionsComponent = function DeviceInstructionsComponent(_ref) {
    var children = _ref.children,
        props = _objectWithoutProperties(_ref, ['children']);

    return (0, _preact.h)(
        _ContainerComponent2.default,
        props,
        (0, _preact.h)(
            'div',
            null,
            'Follow instructions on your device.'
        )
    );
};

exports.default = DeviceInstructionsComponent;