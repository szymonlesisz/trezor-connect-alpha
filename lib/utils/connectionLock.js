"use strict";

exports.__esModule = true;
exports.lock = lock;
var currentP = Promise.resolve();

function lock(fn) {
    var res = currentP.then(function () {
        return fn();
    });
    currentP = res.catch(function () {
        return true;
    });
    return res;
}