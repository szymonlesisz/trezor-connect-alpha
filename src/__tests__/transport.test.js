/*global require, global, describe, it, beforeEach, expect, jasmine*/

import Trezor from '../js/index-npm';

describe('Initializing', async () => {
    'use strict';


    // initialize device
    try {
        await Trezor.init();
    } catch(error) {
        throw error;
    }

    const handleUiEvent = (event) => {
        switch(event) {
            case 'ui_request_window' :
                Trezor.uiMessage({ type: 'popup_handshake' });
            break;
            case 'ui_request_permission' :
                Trezor.uiMessage({ type: 'ui_receive_permission', data: 'true' });
            break;
        }
    }

    it('Get public key', async (done) => {

        // try {
            await Trezor.init();

            Trezor.on('UI_EVENT', handleUiEvent);

            Trezor.on('device_connect', async () => {

                const resp = await Trezor.getPublicKey({
                    account: 0,
                    confirmation: false
                });

                expect(resp.xpub).toEqual('xpub6D6yNFXJDMMP7VZtiByQSShqFKzFboV5UZjGG7TjLn8eBj9sAqPALEUx8VWFXgsia411CJL8Bnk9KUwCQYm9tUGkH1AGWzNJsugXXnT2Tef');

                done();
            });

        // } catch(error) {

        // }
    });

    // No transport
    // Iframe error

    it('Get public key2', async (done) => {


            await Trezor.init();

            Trezor.on('UI_EVENT', handleUiEvent);

            Trezor.on('device_connect', async () => {

                const resp = await Trezor.getPublicKey({
                    account: 1,
                    confirmation: false
                });

                expect(resp.xpub).toEqual('pub6D6yNFXJDMMP7VZtiByQSShqFKzFboV5UZjGG7TjLn8eBj9sAqPALEUx8VWFXgsia411CJL8Bnk9KUwCQYm9tUGkH1AGWzNJsugXXnT2Tef');

                done();
            });


    });



    // TODO: make sure that device is disconnected
    // will be connected after trezor init
    // it('should connect and get device event', function (done) {
    //     Trezor.init({
    //         //configUrl:
    //     }).then(() => {
    //         console.log("INITED!");
    //         //done();
    //     }).catch(err => {
    //         console.log("ERO", err);
    //     });
    // });

});
