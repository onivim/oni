/**
 * testCoverageReporter.js
 *
 * Reporter for mocha to output the code coverage results
 */

const fs = require("fs")
const path = require("path")
const mkdirp = require("mkdirp")

function Coverage(runner) {
    runner.on("end", () => {
        const outputPath = path.join(__dirname, "..", ".nyc_output")

        mkdirp.sync(outputPath)

        const outputFile = path.join(outputPath, "out.json")

        console.log("Writing code coverage results to: " + outputFile)
        fs.writeFileSync(outputFile, JSON.stringify(window.__coverage__))
    })
}

module.exports = Coverage
