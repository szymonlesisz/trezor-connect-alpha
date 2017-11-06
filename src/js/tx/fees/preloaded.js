/* @flow */
'use strict';

import type {FeeLevel, FeeLevelInfo, FeeHandler} from './index';

export type PreloadedFeeLevelInfo = {
    +type: 'preloaded',
    +fee: number,
}

let feeLevels: $ReadOnlyArray<FeeLevel> = [];

async function detectWorking(bitcore): Promise<boolean> {
    feeLevels = Object.keys(getCoinInfo().defaultFees)
        .sort((levelA, levelB) =>
            getCoinInfo().defaultFees[levelB] - getCoinInfo().defaultFees[levelA]
        ).map((level, i) => {
            return {
                name: level.toLowerCase(),
                id: i,
                info: {
                    type: 'preloaded',
                    fee: getCoinInfo().defaultFees[level],
                },
            };
        });
    return feeLevels.length > 0;
}

async function refresh(): Promise<any> {
    return true;
}

function getFeeList(): $ReadOnlyArray<FeeLevel> {
    return feeLevels;
}

function getFee(level: FeeLevelInfo): number {
    if (level.type === 'preloaded') {
        return level.fee;
    }
    throw new Error('Wrong level type');
}

function getBlocks(fee: number): ?number {
    return null;
}

export const preloadedHandler: FeeHandler = {
    refresh,
    detectWorking,
    getFeeList,
    getFee,
    getBlocks,
};