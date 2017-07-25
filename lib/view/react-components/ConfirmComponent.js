'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ContainerComponent = require('./ContainerComponent');

var _ContainerComponent2 = _interopRequireDefault(_ContainerComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ConfirmComponent = function ConfirmComponent(props) {
    return h(
        _ContainerComponent2.default,
        props,
        h(
            'div',
            null,
            'Follow instructions on your device.'
        )
    );
};

exports.default = ConfirmComponent;