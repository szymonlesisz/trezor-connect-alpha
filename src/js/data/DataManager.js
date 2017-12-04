/* @flow */
'use strict';

import { httpRequest } from '../utils/networkUtils';
import type { ConnectSettings } from '../entrypoints/ConnectSettings';
import { parseCoinsJson } from '../backend/CoinInfo';
import type { CoinInfo } from '../backend/CoinInfo';

export default class DataManager {

    static coins: Array<CoinInfo>;
    static releases: JSON;
    static settings: ConnectSettings;
    static cachePassphrase: boolean = false;

    static async load(settings: ConnectSettings): Promise<void> {
        const coinsUrl: string = settings.coins_src;
        const releasesUrl: string = settings.firmware_releases_src;

        try {
            const coins: JSON = await httpRequest(coinsUrl, 'json');
            const releases: JSON = await httpRequest(releasesUrl, 'json');

            this.coins = parseCoinsJson(coins);
            this.releases = releases;
            this.settings = settings;
        } catch (error) {
            // throw new Error('Cannot load config', error);
            throw error;
        }
    }

    static getCoins(): Array<CoinInfo> {
        return this.coins;
    }

    static getRequiredFirmware(): string {
        console.log(this.releases);
        return '1.5.1';
    }

    static getSettings(key: ?string): any {
        if (typeof key === 'string') {
            return this.settings[key];
        }
        return this.settings;
    }

    static getDebugSettings(type: string): boolean {
        // if (this.json.app) {
        //     const app: any = this.json.app;
        //     return app.debug[type];
        // }
        return false;
    }

    static getTransportConfigURL(): string {
        // if (this.json && this.json.app && this.json.app.transport_url) {
        //     return this.json.app.transport_url;
        // }
        // return "https://wallet.trezor.io/data/config_signed.bin";
        return 'config_signed.bin';
    }

    static isPassphraseCached(status: ?boolean): boolean {
        if (typeof status === 'boolean') {
            this.cachePassphrase = status;
        }
        return this.cachePassphrase; // this.json.device.cachePassphrase;
    }
}
