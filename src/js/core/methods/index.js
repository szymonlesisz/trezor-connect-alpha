/* @flow */
'use strict';

import type { MethodCollection } from './parameters';

//import { method as getxpub, confirmation as getxpubConfirmation, params as getxpubParams } from './getxpub';
import getxpub from './getxpub';
import discovery from './discovery';
import composetx from './composetx';

const methods: {[k: string]: MethodCollection} = {
    "getxpub" : getxpub,
    "composetx" : composetx,
    "discovery": discovery
};

export const find = (name: string): ?MethodCollection => {
    if (methods[name]) {
        return methods[name];
    }
    return null;
}

export default find;