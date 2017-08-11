var webpack = require("webpack");

const baseConfig = require("./webpack.debug.config.js")

const OptimizeJsPlugin = require("optimize-js-plugin")
const BabiliPlugin = require("babili-webpack-plugin")

const productionConfig = Object.assign({}, baseConfig, {
    plugins: [
        new webpack.DefinePlugin({
            "process.env.NODE_ENV":'"production"'
        }),
        new BabiliPlugin(),
        new OptimizeJsPlugin({
            sourceMap: false
        })
    ],
})

module.exports = productionConfig
