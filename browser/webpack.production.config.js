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
    ts: {
        configFileName: "tsconfig.src.json"
    },
    resolve: {
        extensions: ['', '.webpack.js', '.js', '.jsx', '.ts', '.tsx']
    },
    output: {
        path: path.join(__dirname, "..", "dist", "browser"),
        publicPath: "/",
        filename: "bundle.js"
    },
    devServer: {
        contentBase: "./dist",
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env.NODE_ENV":'"production"'
        }),
        // Unfortunately, the packaged version of UglifyJS doesn't support ES6
        // https://github.com/mishoo/UglifyJS2/issues/448
        //
        // This could help the app load performance, because a non-trivial amount of time is spent loading & parsing the script
        // new webpack.optimize.UglifyJsPlugin({
        //     minimize: true,
        //     sourceMap: false
        // }),
        new OptimizeJsPlugin({
            sourcemap: false
        })
    ],
    node: {
        process: false,
        __dirname: false
    }
};
