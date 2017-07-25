'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // import {
//     BitcoreBlockchain,
//     WorkerChannel,
//     WorkerDiscovery,
// } from 'hd-wallet';

// import {
//     BitcoreBlockchain,
//     WorkerChannel,
//     WorkerDiscovery,
// } from 'hd-wallet/lib/hdwallet';


var _hdWallet = require('hd-wallet');

var _pathUtils = require('../utils/pathUtils');

var _inside = require('worker-loader?name=socketio-worker.js!../../node_modules/hd-wallet/lib/socketio-worker/inside');

var _inside2 = _interopRequireDefault(_inside);

var _index = require('worker-loader?name=discovery-worker.js!../../node_modules/hd-wallet/lib/discovery/worker/inside/index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

console.log("PROCESS", process.env.NODE_ENV);

var SOCKETIO_WORKER_PATH = 'socketio-worker.js';
var DISCOVERY_WORKER_PATH = 'discovery-worker.js';
var XPUBGENERATOR_WORKER_PATH = 'xpubgenerator-worker.js';

// from balified src


// from balified src
//import SocketWorker from 'worker-loader!../../node_modules/hd-wallet/lib/socketio-worker/inside';
//import SocketWorker from 'worker-loader?inline&fallback=false!../../node_modules/hd-wallet/lib/socketio-worker/inside';
//import DiscoveryWorker from 'worker-loader?inline&fallback=false!../../node_modules/hd-wallet/lib/discovery/worker/inside/index';

//console.log("SOKET!", SocketWorker)


// from bundle
// import SocketWorker from 'worker-loader?inline&fallback=false!../../node_modules/hd-wallet/lib/socket-worker';
// import DiscoveryWorker from 'worker-loader?inline&fallback=false!../../node_modules/hd-wallet/lib/discovery-worker';

// from source
//import SocketWorker from 'worker-loader?inline&fallback=false!../../node_modules/hd-wallet/lib/socketio-worker/inside';
//import DiscoveryWorker from 'worker-loader?inline&fallback=false!../../node_modules/hd-wallet/lib/discovery/worker/inside';
//import TrezorCryptoWorker from 'worker-loader?inline&fallback=false!../../node_modules/hd-wallet/lib/trezor-crypto/emscripten/trezor-crypto';
//const TrezorCryptoWorker = () => {};

// import SocketWorker from 'worker-loader?name=SocketWorker.js!../../node_modules/hd-wallet/lib/socketio-worker/inside';
// import DiscoveryWorker from 'worker-loader?name=DiscoveryWorker.js!../../node_modules/hd-wallet/lib/discovery/worker/inside';
// import TrezorCryptoWorker from 'worker-loader?name=CryptoWorker.js!../../node_modules/hd-wallet/lib/trezor-crypto/emscripten/trezor-crypto';


// import SocketWorker from 'worker-loader?inline&fallback=false!../../node_modules/hd-wallet2/dist/socket-worker.js';
// import DiscoveryWorker from 'worker-loader?inline&fallback=false!../../node_modules/hd-wallet2/dist/discovery-worker.js';
// import TrezorCryptoWorker from 'worker-loader?inline&fallback=false!../../node_modules/hd-wallet2/dist/trezor-crypto.js';

function createBlockchain() {
    var BITCORE_URLS = ['https://bitcore3.trezor.io', 'https://bitcore1.trezor.io'];
    return new _hdWallet.BitcoreBlockchain(BITCORE_URLS, function () {
        return createSocketWorker();
    });
}

function createSocketWorker() {
    //let worker = process.env.NODE_ENV === 'umd-lib' ? new Worker(SOCKETIO_WORKER_PATH) : new SocketWorker();
    var worker = new _inside2.default();
    return worker;
}

function createDiscoveryWorker() {
    var worker = new _index2.default();
    //let worker = process.env.NODE_ENV === 'umd-lib' ? new Worker(DISCOVERY_WORKER_PATH) : new DiscoveryWorker();
    return worker;
}

function createCryptoChannel() {
    // const CRYPTO_WORKER_PATH = '../vendor/trezor-crypto-dist.js';
    // let worker = new Worker(CRYPTO_WORKER_PATH);
    // let channel = new hd.WorkerChannel(worker);
    // return channel;
}

var Account = function () {
    function Account(id, node) {
        _classCallCheck(this, Account);

        //console.log("DiscoveryWorker", DiscoveryWorker, new DiscoveryWorker() )
        this.node = node;
        this.unspents = [];
        //this.worker = new TrezorCryptoWorker();
        this.worker = createSocketWorker();
        this.channel = new _hdWallet.WorkerChannel(this.worker);
        this.blockchain = createBlockchain();
        this.discovery = new _hdWallet.WorkerDiscovery(function () {
            return createDiscoveryWorker();
        }, this.channel, this.blockchain);
    }

    _createClass(Account, [{
        key: 'discover',
        value: function discover() {
            console.log("HD");
            //hd.lookupBlockRange(this.blockchain, null);
        }
    }, {
        key: 'getIndex',
        value: function getIndex() {
            return getPathForIndex(this.node.index);
        }
    }, {
        key: 'getBalance',
        value: function getBalance() {
            return this.unspents.reduce(function (b, u) {
                return b + u.value;
            }, 0);
        }
    }]);

    return Account;
}();

exports.default = Account;