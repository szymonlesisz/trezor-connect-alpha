/* @flow */
'use strict';

export default class ConfigManager {

    static json: Config;

    static async load(): Promise<void> {
        const response = await window.fetch('config.json', { credentials: 'same-origin' });
        if (response.ok) {
            const json: JSON = await response.json();
            ;
            ConfigManager.init(json);
        } else {
            throw new Error('Cannot load config');
        }
    }

    static init(json: JSON): void {
        this.json = parse(json);
    }

    static getDebugSettings(type: string): boolean {
        if (this.json.app) {
            const app: any = this.json.app;
            return app.debug[type];
        }
        return false;
    }

    static getTransportConfigURL(): string {
        if (this.json && this.json.app && this.json.app.transport_url) {
            return this.json.app.transport_url;
        }
        return "https://wallet.trezor.io/data/config_signed.bin";
    }

    static cachePassphrase(): boolean {
        return true; //this.json.device.cachePassphrase;
    }

    static getMethodParams(name: string): Object {
        if (typeof this.json.methods === 'object'){
            // let method = this.json.methods[name.toLowerCase()];
            return {
                requiredFirmware: '1.1.1',
                rules: []
            };
        }else {
            return {};
        }

    }
}

const parse = (json: JSON): Config => {

    const config: Config = {
        app: {},
        device: [],
        methods: []
    };

    let key: string;
    if (json.app && typeof json.app === 'object') {
        for (key of Object.keys(json.app)) {
            config.app[key] = json.app[key];
        }
    }

    if (json.device) {
        config.device.push({
            "debug": "true"
        })
    }

    // console.log("JSON PARSE", typeof json, Array.isArray(json));
    // let rootKey: string;
    // let itemKey: string;
    // for (rootKey of Object.keys(json)) {
    //     console.log("root", rootKey, json[rootKey]);
    //     for (itemKey of Object.keys(json[rootKey])) {
    //         console.log("item", itemKey)
    //     }
    // }
    // json.map( node => {
    //     console.log("PArse", node)
    // });

    return config;
}

type Config = {
    app: { [string]: any };
    device: Array<{ [string]: string }>;
    methods: Array<{ [string]: string }>;
}

type Method = {
    name: string;
    requiredFirmware: string;
    rules: Array<MethodParam>;
}

type MethodParam = {
    name: string;
    type: string;
    required: boolean;
}
