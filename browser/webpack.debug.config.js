var path = require("path");
var webpack = require("webpack");
// var lessPluginAutoPrefix = require("less-plugin-autoprefix");
// var OptimizeJsPlugin = require("optimize-js-plugin")

module.exports = {
    entry: [
        path.join(__dirname, "src/index.tsx")
    ],
    target: "electron-renderer",
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".less"]
    },
    module: {
        rules: [
            {
                test: /\.less$/,
                use: [{
                    loader: "style-loader" // creates style nodes from JS strings
                }, {
                    loader: "css-loader" // translates CSS into CommonJS
                }, {
                    loader: "less-loader" // compiles Less to CSS
                }]
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ],
                exclude: /node_modules/
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    output: {
        path: path.join(__dirname, "..", "lib", "browser"),
        publicPath: "/",
        filename: "bundle.js"
    },
    node: {
        process: false,
        __dirname: false
    }
};
