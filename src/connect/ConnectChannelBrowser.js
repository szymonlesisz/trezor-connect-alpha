// @flow

import ConnectChannel, { SHOW_OPERATION, UPDATE_VIEW, REQUEST_CONFIRM } from './ConnectChannel';
import DeviceList from '../device/DeviceList';
import trezorLink from 'trezor-link';
import type HDNode from 'bticoin-zcash';

import { setFetch as installersSetFetch } from '../utils/installers';
import { getPathFromDescription } from '../utils/pathUtils';
import Account from './Account';
import AccountsList from './AccountsList';

const { Bridge, Extension, Lowlevel, WebUsb, Fallback } = trezorLink;
let sharedWorkerFactory: () => SharedWorker = () => { throw new Error('Shared worker not set.'); };
DeviceList._setTransport(() =>
    new Fallback(
        [
            new Extension(),
            new Bridge(),
            new Lowlevel(
                new WebUsb(),
                () =>
                    sharedWorkerFactory()
            )
        ]
    )
);

DeviceList._setFetch(window.fetch);
installersSetFetch(window.fetch);

export default class ConnectChannelBrowser extends ConnectChannel {

    getAccount(node: any): Account {
        return new Account(node);
    }

    /**
     * Method
     *
     * @param {Object} description
     * @returns {Promise.<Object>}
     */
    async getXPubKey(args: Object): Promise<Object> {
        let path = getPathFromDescription(args.description);
        //let path = getPathFromDescription(args.descriptionFake);
        //if (path !== undefined && path !== null && !args.accountDetail) {
        if (!args.accountDiscovery) {
            return await super.getXPubKey(args);
        }

        // custom implementation with Account discovery

        this.emit(SHOW_OPERATION, 'operation_getXPubKey');


        return await this.initDevice()
            .then(device => {
                const updateAccountList = (node: HDNode) => {
                    let acc = new Account(node);
                    //acc.discover();
                    this.emit(UPDATE_VIEW, node );
                }

                AccountsList.get(device, updateAccountList)
                .then((list: Array<HDNode>) => {
                    console.log("ACC list", list);
                    // TODO
                });

                // wait for account selection
                return new Promise(resolve => {
                    this.emit(REQUEST_CONFIRM, {
                        type: 'xpubAccountList',
                        callback: submit => resolve(submit)
                    });
                });
            })
            .then(submit => {
                if(submit){
                    if(path){
                        return this.device.session.getPublicKey(path);
                    }else{

                    }
                }else{
                    // TODO: all errors should be stored in one place, not hardcoded
                    throw Error('Not confirmed');
                }
            })
    }
}
