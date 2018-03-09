const path = require("path")

const webpack = require("webpack")

// Override 'development' settings
const baseConfig = require("./webpack.development.config.js")

const debugConfig = Object.assign({}, baseConfig, {
    plugins: [
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": '"development"',
        }),
        new webpack.optimize.CommonsChunkPlugin({
            async: true,
            minChunks: 2,
        }),
    ],
    output: {
        path: path.join(__dirname, "..", "lib", "browser"),
        publicPath: "lib/browser/",
        filename: "bundle.js",
        chunkFilename: "[name].bundle.js",
    },
})

module.exports = debugConfig
