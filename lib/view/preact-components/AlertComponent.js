'use strict';

exports.__esModule = true;

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _preact = require('preact');

var _ContainerComponent = require('./ContainerComponent');

var _ContainerComponent2 = _interopRequireDefault(_ContainerComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AlertComponent = function AlertComponent(_ref) {
    var children = _ref.children,
        props = (0, _objectWithoutProperties3.default)(_ref, ['children']);
    return (0, _preact.h)(
        _ContainerComponent2.default,
        props,
        (0, _preact.h)(
            'div',
            null,
            props.alertType
        )
    );
};

exports.default = AlertComponent;