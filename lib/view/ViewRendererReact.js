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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import ConfirmComponent from './components/ConfirmComponent';
// import PinComponent from './components/PinComponent';
// import XPubComponent from './components/XPubComponent';
// import LoaderComponent from './components/LoaderComponent';

var ViewRenderer = function (_EventEmitter) {
    (0, _inherits3.default)(ViewRenderer, _EventEmitter);

    function ViewRenderer() {
        (0, _classCallCheck3.default)(this, ViewRenderer);
        return (0, _possibleConstructorReturn3.default)(this, _EventEmitter.apply(this, arguments));
    }

    return ViewRenderer;
}(_EventEmitter3.default); // import React from 'react';
// import ReactDOM from 'react-dom';


exports.default = ViewRenderer;