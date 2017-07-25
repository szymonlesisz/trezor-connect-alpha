// @flow

import { getPathFromIndex } from '../utils/pathUtils';
import { resolveAfter } from '../utils/promiseUtils';
import type ConnectedDevice from './ConnectedDevice';
//import type HDNode from 'bitcoinjs-lib-zcash';

export default class AccountsList {

    static interrupt: boolean;

    static async get(device: ConnectedDevice, updateCallback: Function): Promise<any> {
        let list = [];
        return await [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].reduce(
            (promise: Promise<any>, current: number) => {
                return promise.then(hdnode => {
                    let path = getPathFromIndex(current);
                    return device.getNode(path)
                    .then( (node: HDNode) => {

                        list.push(node);

                        if (updateCallback !== undefined)
                            //updateCallback(list);
                            updateCallback(path, node);
                        return list;
                    });
                });
            },
            Promise.resolve()
        );

    }

    constructor(){

    }
}
