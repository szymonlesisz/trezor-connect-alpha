import * as constants from '../constants';
import express from 'express';
import webpack from 'webpack';
import config from './webpack.config.browser';
import webpackDevMiddleware from 'webpack-dev-middleware';
import chokidar from 'chokidar';
import stylesheet from '../stylesheet';

// running connect server
function runConnectServer() {
    const app = express();
    const compiler = webpack(config.connect);

    app.use(webpackDevMiddleware(compiler, {
        noInfo: false,
        stats: { colors: true },
    }));

    app.get('*', (req, res) => {
        res.sendFile(constants.CONNECT_HTML_SRC + req.params[0]);
    });

    return new Promise((resolve, reject) => {
        app.listen(constants.CONNECT_PORT, 'localhost', (err) => {
            if (err) {
                reject(err);
                return;
            }
            console.log(`Listening at http://localhost:${constants.CONNECT_PORT}`);
            resolve();
        });
    });
}

// run the explorer server
function runExplorerServer() {
    const app = express();
    const compiler = webpack(config.explorer);

    app.use(webpackDevMiddleware(compiler, {
        noInfo: false,
        stats: { colors: true },
    }));

    app.get('*', (req, res) => {
        res.sendFile(constants.EXPLORER_HTML_SRC + req.params[0]);
    });

    return new Promise((resolve, reject) => {
        app.listen(constants.EXPLORER_PORT, 'localhost', (err) => {
            if (err) {
                reject(err);
                return;
            }
            console.log(`Listening at http://localhost:${constants.EXPLORER_PORT}`);
            resolve();
        });
    });
}

runConnectServer().then(runExplorerServer);

// Watch less changes
const watcher = chokidar.watch('./src/styles/iframe/*.less');
watcher.on('ready', (a) => {
    watcher.on('all', (event, path) => {
        stylesheet(path, () => {
            console.log('CSS recompiled...');
        });
    });
});
