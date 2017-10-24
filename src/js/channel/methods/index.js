/* @flow */
'use strict';

import type { MethodCollection } from './parameters';

//import { method as getxpub, confirmation as getxpubConfirmation, params as getxpubParams } from './getxpub';
import getxpub from './getxpub';
import discover from './discover';

const methods: {[k: string]: MethodCollection} = {
    "getxpub" : getxpub,
    //"discover": discover
};

export const find = (name: string): ?MethodCollection => {
    if (methods[name]) {
        return methods[name];
    }
    return null;
}

export default find;
