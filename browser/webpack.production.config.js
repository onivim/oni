const path = require("path")

const webpack = require("webpack")

const baseConfig = require("./webpack.debug.config.js")

const OptimizeJsPlugin = require("optimize-js-plugin")
const BabiliPlugin = require("babili-webpack-plugin")

const productionConfig = Object.assign({}, baseConfig, {
    devtool: false,
    plugins: [
        new webpack.DefinePlugin({
            "process.env.NODE_ENV":'"production"'
        }),
        new webpack.optimize.CommonsChunkPlugin({
            async: true,
            minChunks: 2,
        }),
        new BabiliPlugin(),
        new OptimizeJsPlugin({
            sourceMap: false
        }),
    ],
    output: {
        path: path.join(__dirname, "..", "lib", "browser"),
        publicPath: "lib/browser/",
        filename: "bundle.js",
        chunkFilename: "[name].bundle.js"
    },
})

module.exports = productionConfig
