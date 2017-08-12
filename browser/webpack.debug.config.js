var path = require("path");
var webpack = require("webpack");

module.exports = {
    entry: [
        path.join(__dirname, "src/index.tsx")
    ],
    target: "electron-renderer",
    externals: {
        "vscode-languageserver-types": "require('vscode-languageserver-types')"
    },
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
    plugins: [
        new webpack.DefinePlugin({
            "process.env.NODE_ENV":'"development"'
        }),
    ],
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
