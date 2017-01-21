var path = require("path");
var webpack = require("webpack");
var lessPluginAutoPrefix = require("less-plugin-autoprefix");

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
                "react-hot",
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
        path: path.join(__dirname, "..", "dist", "browser"),
        publicPath: "http://localhost:8191/",
        filename: "bundle.js"
    },
    devServer: {
        contentBase: "./dist",
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env.NODE_ENV":'"development"'
        })
    ],
    node: {
        process: false,
        __dirname: false
    }
};
