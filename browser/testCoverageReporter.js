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

const addJestCoverage = coverageMap => {
    const jestCoverageFile = path.join(__dirname, "..", "coverage", "jest", "coverage-final.json")
    try {
        const json = fs.readFileSync(jestCoverageFile)
        console.log("coverage file", json)
        if (json) {
            coverageMap.merge(JSON.parse(json))
            console.log("Adding jest coverage map")
        }
    } catch (e) {
        console.log("Error merging jest coverage: ", e)
    }
}

function Coverage(runner) {
    runner.on("end", () => {
        const mainReporter = istanbulAPI.createReporter()
        const coverageMap = libCoverage.createCoverageMap()
        console.log("Merging coverage map...")
        addJestCoverage(coverageMap)
        coverageMap.merge(window.__coverage__ || {})
        console.log("Merging coverage map complete")

        console.log("Adding reporters...")
        mainReporter.addAll(["text", "json", "html", "lcov"])
        console.log("Writing code coverage map...")
        mainReporter.write(coverageMap, {})
        console.log("Complete!")
    })
}

module.exports = Coverage
