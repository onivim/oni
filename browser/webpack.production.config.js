const path = require("path")

const webpack = require("webpack")

// Override 'debug' settings
const baseConfig = require("./webpack.debug.config.js")

const productionConfig = Object.assign({}, baseConfig, {
    mode: "production",
    devtool: false,
    plugins: [
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": '"production"',
        }),
    ],
})

module.exports = productionConfig
