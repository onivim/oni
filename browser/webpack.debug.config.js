const path = require("path")

const webpack = require("webpack")

// Override 'development' settings
const baseConfig = require("./webpack.development.config.js")

const debugConfig = Object.assign({}, baseConfig, {
    devtool: "source-map",
    plugins: [
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": '"development"',
        }),
    ],
    optimization: {
        splitChunks: {
            name: "vendor",
            minChunks: 2,
        },
    },
    output: {
        path: path.join(__dirname, "..", "lib", "browser"),
        publicPath: "lib/browser/",
        filename: "bundle.js",
        chunkFilename: "[name].bundle.js",
    },
})

module.exports = debugConfig
