//import Promise from 'bluebird';
import { getPathFromIndex } from '../utils/pathUtils';
import { resolveAfter } from '../utils/promiseUtils';
import type ConnectedDevice from './ConnectedDevice';

export default class AccountsList {

    static async get(device: ConnectedDevice, updateCallback: Function): Array<any> {
        let list = [];

        return await [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].reduce(
            (promise: Promise<any>, current: number) => {
                return promise.then(hdnode => {
                    let path = getPathFromIndex(current);
                    return device.getNode(path)
                    .then(node => {
                        list.push(node);
                        if (updateCallback !== undefined)
                            updateCallback(node);
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
