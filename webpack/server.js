import { SRC, DIST, PORT, DEV_INDEX_BROWSER, DEV_INDEX_REACT, DEV_INDEX_ELECTRON } from './constants';
import express from 'express';
import webpack from 'webpack';
import open from 'open';
import { spawn } from 'child_process';
import { argv } from 'yargs';
import chokidar from 'chokidar';
import stylesheet from './stylesheet';

let config = null;
let index = null;

switch(argv.config){
    case 'react' :
        config = require('./webpack.config.dev.react');
        index = DEV_INDEX_REACT;
        break;

    case 'electron' :
        config = require('./webpack.config.dev.electron');
        index = DEV_INDEX_ELECTRON;
        break;

    case 'browser-lite' :
        config = require('./webpack.config.dev.browser-lite');
        index = DEV_INDEX_BROWSER;
        break;

    case 'browser' :
    default :
        config = require('./webpack.config.dev.browser');
        index = DEV_INDEX_BROWSER;
        break;
}

const ELECTRON_HOT = argv['electron-start-hot'];

const app = express();
const compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler, {
    contentBase: DIST,
    hot: true,
    inline: true,
    compress: true,
    noInfo: false,
    stats: { colors: true }
}));
app.use(require('webpack-hot-middleware')(compiler));

app.get('*', function(req, res) {
    res.sendFile(index);
});

app.listen(PORT, 'localhost', function(err) {
    if (err) {
        console.log(err);
        return;
    }
    if(ELECTRON_HOT){
        spawn('npm', ['run', 'electron-start-hot'], { shell: true, env: process.env, stdio: 'inherit' })
            .on('close', code => process.exit(code))
            .on('error', spawnError => console.error(spawnError));
    }else{
        open(`http://localhost:${PORT}/`);
    }

    console.log(`Listening at http://localhost:${PORT}`);
    console.log(`Serving ${index}`);
});


// Watch less changes
const watcher = chokidar.watch('./src/**/*.less');
watcher.on('ready', (a) => {
    watcher.on('all', (event, path) => {
        stylesheet(path, () => {
            console.log("CSS recompiled...");
        })
    });
});
