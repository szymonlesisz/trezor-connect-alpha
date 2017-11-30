// https://raw.githubusercontent.com/zyml/es6-karma-jasmine-webpack-boilerplate/master/karma.config.js

var path = require('path');
// var webpackConfig = require('./webpack/webpack.config.karma');
//var webpack = require('webpack');

var HtmlWebpackPlugin =  require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractLess = new ExtractTextPlugin({
    filename: './[name].css'
});

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',
        //urlRoot: '/html/',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],



        proxies: {
            "/iframe.html": "http://localhost:9876/base/src/html/iframe.html",
        },

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'src/__tests__/*.test.js': ['webpack', 'sourcemap'],
            //'src/js/iframe/iframe.js': ['webpack', 'sourcemap'],
            //'src/js/*.js': ['webpack', 'sourcemap'],
            //'src/js/index-npm.js': ['webpack', 'sourcemap'],
        },

        // list of files / patterns to load in the browser
        files: [
            //'src/js/trezorjs-npm.js',
            //'src/js/index-npm.js',
            'src/__tests__/*.test.js',
            //{ pattern: 'src/js/index-npm.js', included: true, served: true, nocache: true },
            //{ pattern: 'src/html/coins.json', included: false, served: true, nocache: true },
            //{ pattern: 'src/html/coins.json', included: false, served: true, nocache: true },
            //{ pattern: './src/html/latest.txt', included: false, served: true, nocache: true },
            //{ pattern: 'iframe2.html', included: false, served: true, nocache: true },
        ],

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

        client: {
            //captureConsole: false,
            clearContext: false,
            useIframe: false,
            runInParent: true
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
            // devServer: {
            //     inline: true,
            //     stats: 'minimal',
            //     historyApiFallback: true
            // },
            //context: path.resolve(__dirname, 'src/__tests__'),
            // entry: {
            //     'iframe': './src/js/iframe/iframe.js',
            // },
            output: {
                filename: '[name].js',
                path: '/', //path.resolve(__dirname, 'src/__tests__'),
                publicPath: '/',
            },
            // resolve: {
            //     alias: {
            //         'base': path.resolve(__dirname, 'src')
            //     }
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
                    },
                    {
                        test: /\.less$/,
                        exclude: /node_modules/,
                        loader: extractLess.extract({
                            use: [
                                { loader: 'css-loader' },
                                { loader: 'less-loader' }
                            ],
                            fallback: 'style-loader'
                        })
                    },
                    {
                        test: /\.(wasm)$/,
                        loader: 'file-loader',
                        query: {
                            name: 'js/[name].[ext]',
                        },
                    },
                ]
            },
            // ignoring "fs" import in fastxpub
            node: {
                fs: "empty"
            },

            plugins: [
                extractLess,
                // new HtmlWebpackPlugin({
                //     chunks: ['iframe'],
                //     filename: 'iframe.html',
                //     template: `./src/html/iframe.html`,
                //     inject: true
                // }),
            ]


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
