//import bip44 from 'bip44-constants';
var bip44 = require('bip44-constants');

const HD_HARDENED: number = 0x80000000;


export const validatePath = (path: any): Array<number> => {
    return [0, 0, 0];
}

export function getPathFromDescription(description: any) {
    let path;
    if (typeof description === 'string') {
        path = getHDPath(description);
    }else if(!isNaN(description)){
        path = getPathFromIndex(description);
    }

    // make sure bip32 indices are unsigned
    if (path) {
        path = path.map(i => i >>> 0);
    }

    return path;
}


export function getSerializedPath(path): string {
    return path.map((i) => {
        let s = (i & ~HD_HARDENED).toString();
        if (i & HD_HARDENED) {
            return s + "'";
        } else {
            return s;
        }
    }).join('/');
}

export function getPathFromIndex(index: number): Array<number> {
    return [
        (49 | HD_HARDENED) >>> 0,
        (0 | HD_HARDENED) >>> 0,
        (index | HD_HARDENED) >>> 0
    ];
}

export function getIndexFromPath(path) {
    if (path.length !== 3) {
        throw new Error();
    }
    if ((path[0] >>> 0) !== ((44 | HD_HARDENED) >>> 0)) {
        throw new Error();
    }
    if ((path[1] >>> 0) !== ((0 | HD_HARDENED) >>> 0)) {
        throw new Error();
    }
    return ((path[2] & ~HD_HARDENED) >>> 0);
}

export function xpubKeyLabel(path): string {
    let hardened = (i) => path[i] & ~HD_HARDENED;
    if (hardened(0) === 44) {
        let coinName = getCoinName(path[1]);
        return `${coinName} account #${hardened(2) + 1}`;
    }
    if (hardened(0) === 48) {
        return `multisig account #${hardened(2) + 1}`;
    }
    if (path[0] === 45342) {
        if (hardened(1) === 44) {
            return `Copay ID of account #${hardened(2) + 1}`;
        }
        if (hardened(1) === 48) {
            return `Copay ID of multisig account #${hardened(2) + 1}`;
        }
    }
    return 'm/' + getSerializedPath(path);
}

export function getCoinName(n) {
    for (let name of Object.keys(bip44)) {
        let number = parseInt(bip44[name]);
        if (number === n) {
            return name;
        }
    };
    return 'Unknown coin';
}

export function getHDPath(str: string): string {
    return str
        .toLowerCase()
        .split('/')
        .filter(function (p) { return p !== 'm'; })
        .map(function (p) {
            var hardened = false;
            if (p[p.length - 1] === "'") {
                hardened = true;
                p = p.substr(0, p.length - 1);
            }
            if (isNaN(p)) {
                throw new Error('Not a valid path.');
            }
            var n = parseInt(p);
            if (hardened) { // hardened index
                n = (n | HD_HARDENED) >>> 0;
            }
            return n;
        });
}
