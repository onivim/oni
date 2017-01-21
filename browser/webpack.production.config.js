var webpack = require("webpack");
var OptimizeJsPlugin = require("optimize-js-plugin")

const baseConfig = require("./webpack.debug.config.js")

const productionConfig = Object.assign({}, baseConfig, {
    plugins: [
        new webpack.DefinePlugin({
            "process.env.NODE_ENV":'"production"'
        }),
        // Unfortunately, the packaged version of UglifyJS doesn't support ES6
        // https://github.com/mishoo/UglifyJS2/issues/448
        //
        // This could help the app load performance, because a non-trivial amount of time 
        // is spent loading & parsing the script
        //
        // new webpack.optimize.UglifyJsPlugin({
        //     minimize: true,
        //     sourceMap: false
        new OptimizeJsPlugin({
            sourcemap: false
        })
    ],
})

module.exports = productionConfig
