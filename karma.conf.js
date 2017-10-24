// https://raw.githubusercontent.com/zyml/es6-karma-jasmine-webpack-boilerplate/master/karma.config.js

var path = require('path');
// var webpackConfig = require('./webpack/webpack.config.karma');
//var webpack = require('webpack');

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',
        //urlRoot: '/html/',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            //'src/js/trezorjs-npm.js',
            //'src/js/index-npm.js',
            'src/__tests__/*.test.js',
            //{ pattern: 'src/js/index-npm.js', included: true, served: true, nocache: true },
            { pattern: 'src/html/config.json', included: false, served: true, nocache: true },
            { pattern: 'src/html/latest.txt', included: false, served: true, nocache: true },
        ],

        proxies: {
            "/": "http://localhost:9876/base/src/html/",
        },

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'src/__tests__/*.test.js': ['webpack', 'sourcemap'],
            //'src/js/*.js': ['webpack', 'sourcemap'],
            //'src/js/index-npm.js': ['webpack', 'sourcemap'],
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_DEBUG,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        //browsers: ['chrome_without_security'],
        browsers: ['ChromeCanary'],
        //browsers: ['Chrome'],
        //browsers: ['Firefox'],

        customLaunchers: {
            chrome_without_security: {
                base: 'Chrome',
                flags: [
                    '--load-extension=/Users/szymon.lesisz/Library/Application Support/Google/Chrome/Default/Extensions/jcjjhjgimijdkoamemaghajlhegmoclj'
                ],
                displayName: 'Chrome w/o security'
            }
        },

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,

        webpack: {
            cache: true,
            devtool: 'inline-source-map',
            // entry: {
            //     'trezorjs-npm': './src/js/index-npm.js',
            // },
            // output: {
            //     filename: '[name].js',
            //     path: '/',
            //     publicPath: '/',
            //     library: 'Trezor',
            //     libraryTarget: 'umd',
            //     umdNamedDefine: true
            // },
            module: {
                rules: [
                    {
                        test: /\.jsx?$/,
                        //include: path.resolve(__dirname, '../src'),
                        exclude: /node_modules/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: ['env'],
                                plugins: [
                                    "transform-class-properties",
                                    "transform-object-rest-spread",
                                    "transform-flow-strip-types",
                                    ["transform-runtime", {
                                      "polyfill": false,
                                      "regenerator": true
                                    }]
                                ]
                            }
                        }
                    }
                ]
            },
            // module: {
            //     // preloaders: [
            //     //     {
            //     //         test: /-test\.js$/,
            //     //         include: /src/,
            //     //         exclude: /node_modules/,
            //     //         loader: 'babel',
            //     //         query: {
            //     //             cacheDirectory: true,
            //     //         },
            //     //     },
            //     //     {
            //     //         test: /\.js?$/,
            //     //         include: /src/,
            //     //         exclude: /(node_modules|__tests__)/,
            //     //         loader: 'babel-istanbul',
            //     //         query: {
            //     //             cacheDirectory: true,
            //     //         },
            //     //     },
            //     // ],
            //     loaders: [
            //         {
            //             test: /\.js$/,
            //             include: path.resolve(__dirname, '../src'),
            //             exclude: /(node_modules|__tests__)/,
            //             loader: 'babel',
            //             query: {
            //                 cacheDirectory: true,
            //             },
            //         },
            //     ],
            // },
        }


    })
}
