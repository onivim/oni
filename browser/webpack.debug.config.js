var path = require("path");
var webpack = require("webpack");
var lessPluginAutoPrefix = require("less-plugin-autoprefix");
var OptimizeJsPlugin = require("optimize-js-plugin")

module.exports = {
    entry: [
        path.join(__dirname, "src/index.tsx")
    ],
    target: "electron-renderer",

    module: {
        preLoaders: [{
            test: /\.tsx?%/,
            exclude: /(node_modules)/,
            loader: "source-map"
        }],
        loaders: [{
            test: /\.tsx?$/,
            exclude: [/node_modules/],
            loaders: [
                "ts-loader"
            ]
        }, {
            test: /\.less$/,
            loader: "style!css?-url!less"
        }]
    },
    lessLoader: {
        lessPlugins: [
            new lessPluginAutoPrefix({browsers: ["last 2 versions"]})
        ]
    },
    devtool: "source-map",
    ts: {
        configFileName: "tsconfig.src.json"
    },
    resolve: {
        extensions: ['', '.webpack.js', '.js', '.jsx', '.ts', '.tsx']
    },
    output: {
        path: path.join(__dirname, "..", "lib", "browser"),
        publicPath: "/",
        filename: "bundle.js"
    },
    devServer: {
        contentBase: "./lib",
    },
    node: {
        process: false,
        __dirname: false
    }
};
