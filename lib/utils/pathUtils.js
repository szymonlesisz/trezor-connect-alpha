'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getPathFromDescription = getPathFromDescription;
exports.getSerializedPath = getSerializedPath;
exports.getPathFromIndex = getPathFromIndex;
exports.getIndexFromPath = getIndexFromPath;
exports.xpubKeyLabel = xpubKeyLabel;
exports.getCoinName = getCoinName;
exports.getHDPath = getHDPath;
//import bip44 from 'bip44-constants';
var bip44 = require('bip44-constants');

var HD_HARDENED = 0x80000000;

function getPathFromDescription(description) {
    var path = void 0;
    if (typeof description === 'string') {
        path = getHDPath(description);
    } else if (!isNaN(description)) {
        path = getPathFromIndex(description);
    }

    // make sure bip32 indices are unsigned
    if (path) {
        path = path.map(function (i) {
            return i >>> 0;
        });
    }

    return path;
}

function getSerializedPath(path) {
    return path.map(function (i) {
        var s = (i & ~HD_HARDENED).toString();
        if (i & HD_HARDENED) {
            return s + "'";
        } else {
            return s;
        }
    }).join('/');
}

function getPathFromIndex(index) {
    return [(44 | HD_HARDENED) >>> 0, (0 | HD_HARDENED) >>> 0, (index | HD_HARDENED) >>> 0];
}

function getIndexFromPath(path) {
    if (path.length !== 3) {
        throw new Error();
    }
    if (path[0] >>> 0 !== (44 | HD_HARDENED) >>> 0) {
        throw new Error();
    }
    if (path[1] >>> 0 !== (0 | HD_HARDENED) >>> 0) {
        throw new Error();
    }
    return (path[2] & ~HD_HARDENED) >>> 0;
}

function xpubKeyLabel(path) {
    var hardened = function hardened(i) {
        return path[i] & ~HD_HARDENED;
    };
    if (hardened(0) === 44) {
        var coinName = getCoinName(path[1]);
        return coinName + ' account #' + (hardened(2) + 1);
    }
    if (hardened(0) === 48) {
        return 'multisig account #' + (hardened(2) + 1);
    }
    if (path[0] === 45342) {
        if (hardened(1) === 44) {
            return 'Copay ID of account #' + (hardened(2) + 1);
        }
        if (hardened(1) === 48) {
            return 'Copay ID of multisig account #' + (hardened(2) + 1);
        }
    }
    return 'm/' + getSerializedPath(path);
}

function getCoinName(n) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = Object.keys(bip44)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var name = _step.value;

            var number = parseInt(bip44[name]);
            if (number === n) {
                return name;
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    ;
    return 'Unknown coin';
}

function getHDPath(str) {
    return str.toLowerCase().split('/').filter(function (p) {
        return p !== 'm';
    }).map(function (p) {
        var hardened = false;
        if (p[p.length - 1] === "'") {
            hardened = true;
            p = p.substr(0, p.length - 1);
        }
        if (isNaN(p)) {
            throw new Error('Not a valid path.');
        }
        var n = parseInt(p);
        if (hardened) {
            // hardened index
            n = (n | HD_HARDENED) >>> 0;
        }
        return n;
    });
}