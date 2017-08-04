class Account {

    static fromDevice(device, i, cryptoChannel, blockchain) {
        return Account.fromPath(device, Account.getPathForIndex(i), cryptoChannel, blockchain);
    }

    static fromPath(device, path, cryptoChannel, blockchain) {
        const i = (path[path.length - 1] & ~HD_HARDENED) >>> 0;
        return device.getNode(path)
            .then((node) => new Account(node, i, cryptoChannel, blockchain));
    }

    static getPathForIndex(i) {
        return [
            (44 | HD_HARDENED) >>> 0,
            (0 | HD_HARDENED) >>> 0,
            (i | HD_HARDENED) >>> 0
        ];
    }

    constructor(node, id, cryptoChannel, blockchain) {
        this.id = id;
        this.node = node;
        this.unspents = [];
        this.channel = cryptoChannel;
        this.addressSources = this._getSources();
        this.used = false;
        this.nextChange = '';
        this.nextAddress = '';
        this.nextAddressId = null;
        this.addressPaths = {};
        this.blockchain = blockchain;
    }

    _createAddressSource(node) {
        let source;
        source = new hd.WorkerAddressSource(this.channel, node, ADDRESS_VERSION);
        source = new hd.PrefatchingSource(source);
        source = new hd.CachingSource(source);
        return source;
    }

    _getSources() {
        let external = this.node.derive(0);
        let internal = this.node.derive(1);
        let sources = [
            this._createAddressSource(external),
            this._createAddressSource(internal)
        ];
        return sources;
    }

    discover(onUsed) {
        return this._initAccountDiscovery().then(initialState => {
            let process = this._createAccountsDiscoveryProcess(initialState);
            return this._finishAccountDiscovery(process, onUsed);
        }).then(state => {
            this.nextChange = this._nextChangeAddress(state);
            this.nextAddress = this._nextAddress(state);
            this.nextAddressId = this._nextAddressId(state);
            this.used = this._isUsed(state);
            this.addressPaths = this._getAddressPaths(state);
            return this._loadBlockheight().then(blockheight => {
                this.unspents = this._deriveUnspents(state, blockheight);
            });
        });
    }

    _initAccountDiscovery() {
        return this._loadBlocks().then((blocks) => hd.newAccountDiscovery(blocks));
    }

    _createAccountsDiscoveryProcess(initialState) {
        let sources = this.addressSources;
        return hd.discoverAccount(
            initialState,
            sources,
            CHUNK_SIZE,
            this.blockchain,
            GAP_LENGTH
        );
    }

    _getAddressPaths(state) {
        let base = this.getPath();
        let res = {};
        for (let i = 0; i < 2; i++) {
            state[i].chain.indexes.forEach((index, address) => {
                let path = base.concat([i, index]);
                res[address] = path;
            });
        }
        return res;
    }

    _getTransactionCount(state) {
        let size = 0;
        state.forEach(({transactions}) => {
            size = size + transactions.size;
        });
        return size;
    }

    _isUsed(state) {
        let u0 = state[0].history.nextIndex > 0;
        let u1 = state[1].history.nextIndex > 0;
        return u1 || u0;
    }

    _nextChangeAddress(state) {
        let nextIndex = state[1].history.nextIndex;
        let address = state[1].chain.addresses.get(nextIndex);
        return address;
    }

    _nextAddress(state) {
        let nextIndex = state[0].history.nextIndex;
        let address = state[0].chain.addresses.get(nextIndex);
        return address;
    }

    _nextAddressId(state) {
        return state[0].history.nextIndex;
    }

    _finishAccountDiscovery(discovery, onUsed) {
        discovery.values.attach((state) => {
            if (this._isUsed(state)) {
                onUsed();
            }
        });
        return discovery.awaitLast();
    }

    _loadBlockheight() {
        return this.blockchain.lookupSyncStatus().then(({height}) => height);
    }

    _deriveUnspents(state, blockheight) {
        let t0 = state[0].transactions;
        let t1 = state[1].transactions;
        let map = t0.merge(t1);
        let unspents = hd.collectUnspents(
            map,
            state[0].chain,
            state[1].chain
        );
        return unspents.map(unspent => {
            let txId = unspent.id;
            let confirmations = unspent.height ? (blockheight - unspent.height + 1) : undefined;
            let address = bitcoin.address.fromOutputScript(unspent.script);
            let value = unspent.value;
            let vout = unspent.index;
            return {
                txId,
                confirmations,
                address,
                value,
                vout
            };
        });
    }

    _loadBlocks() {
        return hd.lookupBlockRange(this.blockchain, null);
    }

    getPath() {
        return Account.getPathForIndex(this.node.index);
    }

    // usable if the discovery is finished:

    getBalance() {
        return this.unspents
            .reduce((b, u) => b + u.value, 0);
    }

    getConfirmedBalance() {
        return this.unspents
            .filter((u) => u.confirmations > 0)
            .reduce((b, u) => b + u.value, 0);
    }

    getChangeAddress() {
        return this.nextChange;
    }

    getAddressPath(address) {
        return this.addressPaths[address];
    }

    composeTx(outputs, feePerByte) {
        const txDust = 5460;

        let {inputs, change, fee} = selectUnspents(this.unspents, outputs, feePerByte);

        outputs = outputs.slice();

        if (change > txDust) {
            let address = this.getChangeAddress();
            let output = {
                address: address,
                amount: change
            };
            outputs.push(output);
        } else {
            fee = fee + change;
        }

        outputs.sort((a, b) => a.amount - b.amount);

        return {converted: this.convertTxForDevice(inputs, outputs), fee};
    }

    convertTxForDevice(inputs, outputs) {
        return {

            inputs: inputs.map((input) => {
                let address_n = this.getAddressPath(input.address);

                if (!address_n) {
                    throw new Error(`Path not found for input address "${input.address}"`);
                }

                return {
                    script_type: 'SPENDADDRESS',
                    prev_hash: input.txId,
                    prev_index: input.vout,
                    address_n
                };
            }),

            outputs: outputs.map((output) => {
                let decoded = bitcoin.address.fromBase58Check(output.address);
                let scriptType = SCRIPT_TYPES[decoded.version];

                if (!scriptType) {
                    throw new Error(`Address "${output.address}" has no known script type`);
                }

                let address_n = this.getAddressPath(output.address);

                // only change output is specified with address_n
                if (address_n && address_n[address_n.length - 2] === 1) {
                    return {
                        script_type: scriptType,
                        address_n: address_n,
                        amount: output.amount
                    };
                } else {
                    return {
                        script_type: scriptType,
                        address: output.address,
                        amount: output.amount
                    };
                }
            })
        };
    }
}
