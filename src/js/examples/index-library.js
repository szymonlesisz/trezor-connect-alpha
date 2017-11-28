/* @flow */
'use strict';

import TrezorConnect from '../entrypoints/library';
import { initModal } from './modal';
import { onDeviceConnect, onDeviceDisconnect, onDeviceUsedElsewhere } from './deviceMenu';
import styles from  '../../styles/explorer.less';
import stylesModal from  '../../styles/modal.less';
import { discover } from '../account/discovery';

type LegitDiscovery = {
    coin: string;
    label: string;
};


const initTrezorLibrary = () => {

    // inited from script query
    // TrezorConnect.init({
    //     iframe_src: 'iframe.html',
    //     //popup_src: 'popup.html',
    //     coins_src: 'coins.json',
    //     transport_config_src: 'config_signed.bin',
    //     firmware_releases_src: 'releases.json',
    //     latest_bridge_src: 'latest.txt',
    //     debug: false,
    //     notValidParam: function() { }
    // });

    TrezorConnect.init();

    initModal();

    TrezorConnect.on('DEVICE_EVENT', function(event) {
        switch (event.type) {
            case 'device-connect' :
            case 'device-connect_unacquired' :
                onDeviceConnect(event.data);
            break;
            case 'device-disconnect' :
            case 'device-disconnect_unacquired' :
                onDeviceDisconnect(event.data);
            break;
            case 'device-acquired':
            case 'device-released':
                onDeviceUsedElsewhere(event.data);
            break;
        }
    });

    TrezorConnect.on('device-connect', handleDeviceConnect);
    TrezorConnect.on('device-connect_unacquired', handleDeviceConnect);

    TrezorConnect.on('UI_EVENT', (event) => {
        console.warn("UI_EVENT", event);
    });
}

const handleDeviceConnect = (device) => {
    //if (!device.isUsedElsewhere) {
        discoverLegitAccounts();
    //}
}

const limits = {
    'btc1': 0,
    'btc3': 0,
    'ltc1': 0,
    'ltc3': 0,
    'btg1': 0,
    'btg3': 0
}

let pairs = {
    'bch': [
        {
            id: '',
            name: 'Bitcoin Cash on segwit accounts',
            params: {
                discoverLegacyAccounts: false,
                discoveryLimit: 0, // number of segwit BTC accounts
                customCoinInfo: {
                    bip44: 0, // BTC
                    segwit: true,
                },
                coin: 'bch',
            }
        },
        {
            name: 'Bitcoin Cash on legacy accounts',
            params: {
                discoveryLimit: 0, // number of legacy BTC accounts
                customCoinInfo: {
                    bip44: 0, // BTC
                },
                coin: 'bch',
            }
        },
        {
            name: 'Bitcoin Cash on Litecoin segwit accounts',
            params: {
                discoverLegacyAccounts: false,
                discoveryLimit: 0, // number of segwit LTC accounts
                customCoinInfo: {
                    bip44: 2, // LTC
                    segwit: true,
                },
                coin: 'bch',
            }
        },
    ],


    // 'bch': ['btc', 'ltc'],
    // 'ltc': ['btc'],
    // 'btg': ['btc'],
}

//let accountsToDiscover: Array<string> = ['test', 'btc', 'ltc', 'bch'];
//let accountsToDiscover: Array<string> = ['btc', 'ltc', 'bch', 'btg'];
//let accountsToDiscover: Array<string> = ['btc', 'ltc', 'bch'];



type Discovery = {
    id: string;
    label: string;
    full?: boolean;
    params: DiscoveryParams;
    updateParams?: Array<string>;
};

type DiscoveryParams = {
    coin: string;
    customCoinInfo?: Object;
    discoveryLimit?: number;
    discoverLegacyAccounts?: boolean;
};

type CustomCoinInfo = {
    bip44?: number;
    segwit?: boolean;
};

const defaultParams: Object = {
    onStart: onAccountDiscoveryStart,
    onUpdate: onAccountDiscoveryUpdate,
    onComplete: onAccountDiscoveryComplete,
};


let discovery: Array<Discovery> = [
    {
        id: 'ltc',
        label: 'Bitcoin Gold',
        full: true,
        params: {
            coin: 'btc',
        }
    },
];

let discoveryA: Array<Discovery> = [
    {
        id: 'btc',
        label: 'Bitcoin Gold',
        full: true,
        params: {
            coin: 'btg',
        }
    },
    {
        id: 'btg-btc3',
        label: 'Bitcoin Gold on Bitcoin address',
        params: {
            coin: 'btg',
            discoveryLimit: 0,
            discoverLegacyAccounts: false,
            customCoinInfo: {
                bip44: 0,
            }
        }
    },
    // BTG on BTC legacy
    {
        id: 'btg-btc1',
        label: 'Bitcoin Gold on Bitcoin legacy address',
        params: {
            coin: 'btg',
            discoveryLimit: 0,
            customCoinInfo: {
                bip44: 0,
                segwit: false
            }
        }
    },
];

let discovery1: Array<Discovery> = [
    // BTC full
    {
        id: 'btc',
        label: 'Bitcoin',
        full: true,
        params: {
            coin: 'btc',
        }
    },
    // BTG full
    {
        id: 'btg',
        label: 'Bitcoin Gold',
        full: true,
        params: {
            coin: 'btg',
        }
    },
    // BTG on BTC segwit
    {
        id: 'btg-btc3',
        label: 'Bitcoin Gold on Bitcoin address',
        params: {
            coin: 'btg',
            discoveryLimit: 0,
            discoverLegacyAccounts: false,
            customCoinInfo: {
                bip44: 0,
            }
        }
    },
    // BTG on BTC legacy
    {
        id: 'btg-btc1',
        label: 'Bitcoin Gold on Bitcoin legacy address',
        params: {
            coin: 'btg',
            discoveryLimit: 0,
            customCoinInfo: {
                bip44: 0,
                segwit: false
            }
        }
    },
    // LTC on BTC segwit
    {
        id: 'ltc-btc3',
        label: 'Litecoin on Bitcoin address',
        params: {
            coin: 'ltc',
            discoveryLimit: 0,
            discoverLegacyAccounts: false,
            customCoinInfo: {
                bip44: 0,
            }
        }
    },
    // BCH on BTC legacy
    {
        id: 'bch-btc1',
        label: 'Bitcoin Cash on Bitcoin legacy address',
        params: {
            coin: 'bch',
            discoveryLimit: 0,
            customCoinInfo: {
                bip44: 0,
                segwit: false,
            }
        }
    },
    // BTC on LTC segwit
    {
        id: 'btc-ltc3',
        label: 'Bitcoin on Litecoin address',
        params: {
            coin: 'btc',
            discoveryLimit: 0,
            discoverLegacyAccounts: false,
            customCoinInfo: {
                bip44: 5,
            }
        }
    },
    {
        id: 'btc-btcX',
        label: 'Bitcoin on wrongly generated 1-address (XPUB)',
        params: {
            coin: 'btc',
            discoveryLimit: 0,
            discoverLegacyAccounts: false,
            legacyAddressOnSegwit: true,
        }
    },
];

const updateDiscoveryLimit = (id: string, limit: number): ?Discovery => {
    const item: ?Discovery = discovery.find((d: Discovery) => d.id === id );
    if (item) {
        item.params.discoveryLimit = limit;
    }
}


type LoadedAccountsBundle = {
    id: string;
    label: string;
    full: boolean;
    accounts: Array<any>;
}
const loadedAccountsBundle: Array<LoadedAccountsBundle> = [];

let currentLegitDiscovery: string;
let legitAccountsToDiscover: Array<string> = ['btg'];
let legitAccounts: Object = {};


let discoveryIndex: number = 0;

const discoverLegitAccounts = () => {

    const item: Discovery = discovery[ discoveryIndex];

    TrezorConnect.accountDiscovery({
        ...defaultParams,
        ...item.params
    }).then((response): void => {
        if (response.success) {

            // update discovery params
            if (item.id === 'btc') {
                let segwitAccounts: number = 0;
                let legacyAccounts: number = 0;

                response.data.map((account) => {
                    if (account.coinInfo.segwit) {
                        segwitAccounts++;
                    } else {
                        legacyAccounts++;
                    }
                });
                updateDiscoveryLimit('btg-btc3', segwitAccounts);
                updateDiscoveryLimit('btg-btc1', legacyAccounts);
                updateDiscoveryLimit('btc-btcX', segwitAccounts);
                updateDiscoveryLimit('ltc-btc3', segwitAccounts);
                updateDiscoveryLimit('bch-btc1', legacyAccounts);
            }

            loadedAccountsBundle.push({
                id: item.id,
                label: item.label,
                full: item.full,
                accounts: response.data
            });

            discoveryIndex++;
            if (discoveryIndex < discovery.length) {
                discoverLegitAccounts();
            } else {
                onDiscoveryComplete();
            }

        } else {
            console.warn("TODO: handle errror");
        }
    });
}

const onAccountDiscoveryStart = (newAccount: Account, allAccounts: Array<Account>): void => {

}

const onAccountDiscoveryUpdate = (newAccount: Account, allAccounts: Array<Account>): void => {

}

const onAccountDiscoveryComplete = (allAccounts: Array<Account>): void => {

}

const onDiscoveryComplete = (): void => {

    const ul: HTMLElement = (document.querySelector('.accounts') : any);

    loadedAccountsBundle.map(bundle => {
        if (!bundle.full) {
            bundle.accounts.map(account => {
                if (account.info.utxos.length > 0) {
                    let li: HTMLElement = document.createElement("li");
                    li.setAttribute("data-account", account.id);
                    li.innerHTML = `Account #${( account.id + 1 )}<br/>${ bundle.label }`;
                    ul.appendChild(li);

                    li.onclick = (event) => {
                        console.log("AAAA", event.currentTarget);
                    }
                }
            });
        }
    });
}


// bch
/*
{
    discoverLegacyAccounts: false,
    discoveryLimit: 0, // number of segwit BTC accounts
    customCoinInfo: {
        bip44: 0, // BTC
        segwit: true,
    },
    coin: 'bch',
},
{
    discoveryLimit: 0, // number of legacy BTC accounts
    customCoinInfo: {
        bip44: 0, // BTC
    },
    coin: 'bch',
},
{
    discoverLegacyAccounts: false,
    discoveryLimit: 0, // number of segwit BTC accounts
    customCoinInfo: {
        bip44: 2, // LTC
        segwit: true,
    },
    coin: 'bch',
},
*/

// btc
/*
{
    discoveryLimit: 0, // number of segwit BTC accounts
    customCoinInfo: {
        bip44: 0, // BTC
        segwit: true,
    },
    coin: 'btc',
},

// - bch
// - btg
// - ltc
// - btcX
*/

// ltc
/*
// - btc3
*/

// testnet
/*{
// - testnetX
}*/




window.addEventListener('load', function() {
    initTrezorLibrary();
    //initExample();
});
