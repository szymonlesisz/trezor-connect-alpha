'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Account = function () {
    _createClass(Account, null, [{
        key: 'fromDevice',
        value: function fromDevice(device, i, cryptoChannel, blockchain) {
            return Account.fromPath(device, Account.getPathForIndex(i), cryptoChannel, blockchain);
        }
    }, {
        key: 'fromPath',
        value: function fromPath(device, path, cryptoChannel, blockchain) {
            var i = (path[path.length - 1] & ~HD_HARDENED) >>> 0;
            return device.getNode(path).then(function (node) {
                return new Account(node, i, cryptoChannel, blockchain);
            });
        }
    }, {
        key: 'getPathForIndex',
        value: function getPathForIndex(i) {
            return [(44 | HD_HARDENED) >>> 0, (0 | HD_HARDENED) >>> 0, (i | HD_HARDENED) >>> 0];
        }
    }]);

    function Account(node, id, cryptoChannel, blockchain) {
        _classCallCheck(this, Account);

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

    _createClass(Account, [{
        key: '_createAddressSource',
        value: function _createAddressSource(node) {
            var source = void 0;
            source = new hd.WorkerAddressSource(this.channel, node, ADDRESS_VERSION);
            source = new hd.PrefatchingSource(source);
            source = new hd.CachingSource(source);
            return source;
        }
    }, {
        key: '_getSources',
        value: function _getSources() {
            var external = this.node.derive(0);
            var internal = this.node.derive(1);
            var sources = [this._createAddressSource(external), this._createAddressSource(internal)];
            return sources;
        }
    }, {
        key: 'discover',
        value: function discover(onUsed) {
            var _this = this;

            return this._initAccountDiscovery().then(function (initialState) {
                var process = _this._createAccountsDiscoveryProcess(initialState);
                return _this._finishAccountDiscovery(process, onUsed);
            }).then(function (state) {
                _this.nextChange = _this._nextChangeAddress(state);
                _this.nextAddress = _this._nextAddress(state);
                _this.nextAddressId = _this._nextAddressId(state);
                _this.used = _this._isUsed(state);
                _this.addressPaths = _this._getAddressPaths(state);
                return _this._loadBlockheight().then(function (blockheight) {
                    _this.unspents = _this._deriveUnspents(state, blockheight);
                });
            });
        }
    }, {
        key: '_initAccountDiscovery',
        value: function _initAccountDiscovery() {
            return this._loadBlocks().then(function (blocks) {
                return hd.newAccountDiscovery(blocks);
            });
        }
    }, {
        key: '_createAccountsDiscoveryProcess',
        value: function _createAccountsDiscoveryProcess(initialState) {
            var sources = this.addressSources;
            return hd.discoverAccount(initialState, sources, CHUNK_SIZE, this.blockchain, GAP_LENGTH);
        }
    }, {
        key: '_getAddressPaths',
        value: function _getAddressPaths(state) {
            var base = this.getPath();
            var res = {};

            var _loop = function _loop(i) {
                state[i].chain.indexes.forEach(function (index, address) {
                    var path = base.concat([i, index]);
                    res[address] = path;
                });
            };

            for (var i = 0; i < 2; i++) {
                _loop(i);
            }
            return res;
        }
    }, {
        key: '_getTransactionCount',
        value: function _getTransactionCount(state) {
            var size = 0;
            state.forEach(function (_ref) {
                var transactions = _ref.transactions;

                size = size + transactions.size;
            });
            return size;
        }
    }, {
        key: '_isUsed',
        value: function _isUsed(state) {
            var u0 = state[0].history.nextIndex > 0;
            var u1 = state[1].history.nextIndex > 0;
            return u1 || u0;
        }
    }, {
        key: '_nextChangeAddress',
        value: function _nextChangeAddress(state) {
            var nextIndex = state[1].history.nextIndex;
            var address = state[1].chain.addresses.get(nextIndex);
            return address;
        }
    }, {
        key: '_nextAddress',
        value: function _nextAddress(state) {
            var nextIndex = state[0].history.nextIndex;
            var address = state[0].chain.addresses.get(nextIndex);
            return address;
        }
    }, {
        key: '_nextAddressId',
        value: function _nextAddressId(state) {
            return state[0].history.nextIndex;
        }
    }, {
        key: '_finishAccountDiscovery',
        value: function _finishAccountDiscovery(discovery, onUsed) {
            var _this2 = this;

            discovery.values.attach(function (state) {
                if (_this2._isUsed(state)) {
                    onUsed();
                }
            });
            return discovery.awaitLast();
        }
    }, {
        key: '_loadBlockheight',
        value: function _loadBlockheight() {
            return this.blockchain.lookupSyncStatus().then(function (_ref2) {
                var height = _ref2.height;
                return height;
            });
        }
    }, {
        key: '_deriveUnspents',
        value: function _deriveUnspents(state, blockheight) {
            var t0 = state[0].transactions;
            var t1 = state[1].transactions;
            var map = t0.merge(t1);
            var unspents = hd.collectUnspents(map, state[0].chain, state[1].chain);
            return unspents.map(function (unspent) {
                var txId = unspent.id;
                var confirmations = unspent.height ? blockheight - unspent.height + 1 : undefined;
                var address = bitcoin.address.fromOutputScript(unspent.script);
                var value = unspent.value;
                var vout = unspent.index;
                return {
                    txId: txId,
                    confirmations: confirmations,
                    address: address,
                    value: value,
                    vout: vout
                };
            });
        }
    }, {
        key: '_loadBlocks',
        value: function _loadBlocks() {
            return hd.lookupBlockRange(this.blockchain, null);
        }
    }, {
        key: 'getPath',
        value: function getPath() {
            return Account.getPathForIndex(this.node.index);
        }

        // usable if the discovery is finished:

    }, {
        key: 'getBalance',
        value: function getBalance() {
            return this.unspents.reduce(function (b, u) {
                return b + u.value;
            }, 0);
        }
    }, {
        key: 'getConfirmedBalance',
        value: function getConfirmedBalance() {
            return this.unspents.filter(function (u) {
                return u.confirmations > 0;
            }).reduce(function (b, u) {
                return b + u.value;
            }, 0);
        }
    }, {
        key: 'getChangeAddress',
        value: function getChangeAddress() {
            return this.nextChange;
        }
    }, {
        key: 'getAddressPath',
        value: function getAddressPath(address) {
            return this.addressPaths[address];
        }
    }, {
        key: 'composeTx',
        value: function composeTx(outputs, feePerByte) {
            var txDust = 5460;

            var _selectUnspents = selectUnspents(this.unspents, outputs, feePerByte),
                inputs = _selectUnspents.inputs,
                change = _selectUnspents.change,
                fee = _selectUnspents.fee;

            outputs = outputs.slice();

            if (change > txDust) {
                var address = this.getChangeAddress();
                var output = {
                    address: address,
                    amount: change
                };
                outputs.push(output);
            } else {
                fee = fee + change;
            }

            outputs.sort(function (a, b) {
                return a.amount - b.amount;
            });

            return { converted: this.convertTxForDevice(inputs, outputs), fee: fee };
        }
    }, {
        key: 'convertTxForDevice',
        value: function convertTxForDevice(inputs, outputs) {
            var _this3 = this;

            return {

                inputs: inputs.map(function (input) {
                    var address_n = _this3.getAddressPath(input.address);

                    if (!address_n) {
                        throw new Error('Path not found for input address "' + input.address + '"');
                    }

                    return {
                        script_type: 'SPENDADDRESS',
                        prev_hash: input.txId,
                        prev_index: input.vout,
                        address_n: address_n
                    };
                }),

                outputs: outputs.map(function (output) {
                    var decoded = bitcoin.address.fromBase58Check(output.address);
                    var scriptType = SCRIPT_TYPES[decoded.version];

                    if (!scriptType) {
                        throw new Error('Address "' + output.address + '" has no known script type');
                    }

                    var address_n = _this3.getAddressPath(output.address);

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
    }]);

    return Account;
}();