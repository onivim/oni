/**
 * testCoverageReporter.js
 *
 * Reporter for mocha to output the code coverage results
 */

const fs = require("fs")
const path = require("path")
const mkdirp = require("mkdirp")

const istanbulAPI = require("istanbul-api")
const libCoverage = require("istanbul-lib-coverage")

function Coverage(runner) {
    runner.on("end", () => {
        const mainReporter = istanbulAPI.createReporter()
        const coverageMap = libCoverage.createCoverageMap()
        console.log("Merging coverage map...")
        coverageMap.merge(window.__coverage__ || {})
        console.log("Merging coverage map complete")

        console.log("Adding reporters...")
        mainReporter.addAll(["text", "json", "html", "lcov"])
        console.log("Writing code coverage map...")
        mainReporter.write(coverageMap, {})
        console.log("Complete!")

        // const outputPath = path.join(__dirname, "..", ".nyc_output")

        // mkdirp.sync(outputPath)

        // const outputFile = path.join(outputPath, "out.json")

        // console.log("Writing code coverage results to: " + outputFile)
        // fs.writeFileSync(outputFile, JSON.stringify(window.__coverage__))
    })
}

module.exports = Coverage
