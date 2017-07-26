'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _hdWallet = require('hd-wallet');

var _pathUtils = require('../utils/pathUtils');

var _discoveryWorker = require('worker-loader?name=discovery-worker.js!hd-wallet/workers/discovery-worker');

var _discoveryWorker2 = _interopRequireDefault(_discoveryWorker);

var _socketWorker = require('worker-loader?name=socketio-worker.js!hd-wallet/workers/socket-worker');

var _socketWorker2 = _interopRequireDefault(_socketWorker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import {
//     BitcoreBlockchain,
//     WorkerChannel,
//     WorkerDiscovery,
// } from 'hd-wallet';

// import {
//     BitcoreBlockchain,
//     WorkerChannel,
//     WorkerDiscovery,
// } from 'hd-wallet/lib/hdwallet';


console.log("PROCESS", process.env.NODE_ENV);

var SOCKETIO_WORKER_PATH = 'socketio-worker.js';
var DISCOVERY_WORKER_PATH = 'discovery-worker.js';
var XPUBGENERATOR_WORKER_PATH = 'xpubgenerator-worker.js';

//import FastXPubWorker from 'worker-loader?name=fastxpub-worker.js!hd-wallet/workers/fastxpub';

// from balified src

//import DiscoveryWorker from 'worker-loader?name=discovery-worker.js!../../node_modules/hd-wallet/lib/discovery/worker/inside/index';
//import SocketWorker from 'worker-loader?name=socketio-worker.js!../../node_modules/hd-wallet/lib/socketio-worker/inside';
//import FastXPubWorker from 'worker-loader?name=fastxpub-worker.js!../../node_modules/hd-wallet/fastxpub/build/fastxpub';


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
    var worker = new _socketWorker2.default();
    return worker;
}

function createDiscoveryWorker() {
    var worker = new _discoveryWorker2.default();
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
        (0, _classCallCheck3.default)(this, Account);


        this.node = node;
        this.unspents = [];
        this.worker = new FastXPubWorker();
        this.channel = new _hdWallet.WorkerChannel(this.worker);
        this.blockchain = createBlockchain();
        // this.discovery = new WorkerDiscovery(
        //     this.worker,
        //     this.channel,
        //     this.blockchain
        // );
    }

    Account.prototype.discover = function discover() {
        console.log("HD");
        //hd.lookupBlockRange(this.blockchain, null);
    };

    Account.prototype.getIndex = function getIndex() {
        return getPathForIndex(this.node.index);
    };

    Account.prototype.getBalance = function getBalance() {
        return this.unspents.reduce(function (b, u) {
            return b + u.value;
        }, 0);
    };

    return Account;
}();

exports.default = Account;