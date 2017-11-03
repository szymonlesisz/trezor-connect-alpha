//import bip44 from 'bip44-constants';
var bip44 = require('bip44-constants');



export const HD_HARDENED: number = 0x80000000;


export const validatePath = (path: any, coinInfo): Array<number> => {
    let valid: Array<number>;
    if (typeof path === 'string') {
        valid = getHDPath(path);
    } else if (Array.isArray(path)) {
        valid = path.map((p: any) => {
            let n: number = parseInt(p);
            if (isNaN(p)) {
                throw new Error('Not a valid path.');
            }
            return (n | HD_HARDENED) >>> 0;
        });

    }
    if (valid.length < 3) throw new Error('Not a valid path.');
    return valid;
}

export const getAccountIndexFromPath = (path: Array<number>): number => {
    return path[2] & ~HD_HARDENED;
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


export const getPathFromIndex = (bip44purpose: number, bip44cointype: number, index: number): Array<number> => {
    return [
        toHardened(bip44purpose),
        toHardened(bip44cointype),
        toHardened(index)
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

// export function xpubKeyLabel(path): string {
//     let hardened = (i) => path[i] & ~HD_HARDENED;
//     if (hardened(0) === 44) {
//         let coinName = getCoinName(path[1]);
//         return `${coinName} account #${hardened(2) + 1}`;
//     }
//     if (hardened(0) === 48) {
//         return `multisig account #${hardened(2) + 1}`;
//     }
//     if (path[0] === 45342) {
//         if (hardened(1) === 44) {
//             return `Copay ID of account #${hardened(2) + 1}`;
//         }
//         if (hardened(1) === 48) {
//             return `Copay ID of multisig account #${hardened(2) + 1}`;
//         }
//     }
//     return 'm/' + getSerializedPath(path);
// }

export const toHardened = (n: number): number => (n | HD_HARDENED) >>> 0;
export const fromHardened = (n: number): number => (n & ~HD_HARDENED) >>> 0;


export const getHDPath = (path: string): Array<number> => {
    return path
        .toLowerCase()
        .split('/')
        .filter((p: string) => p !== 'm')
        .map((p: string) => {
            let hardened: boolean = false;
            if (p.substr(p.length - 1) === "'") {
                hardened = true;
                p = p.substr(0, p.length - 1);
            }
            let n: number = parseInt(p);
            if (isNaN(p)) {
                throw new Error('Not a valid path.');
            }
            if (hardened) { // hardened index
                n = toHardened(n);
            }
            return n;
        });
}
