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

const addJestCoverage = (map, file = "./../coverage/jest/coverage-final.json") => {
    const json = fs.readFileSync(file)
    map.merge(JSON.parse(json))
}

function Coverage(runner) {
    runner.on("end", () => {
        const mainReporter = istanbulAPI.createReporter()
        const coverageMap = libCoverage.createCoverageMap()
        console.log("Merging coverage map...")
        coverageMap.merge(window.__coverage__ || {})
        console.log("Merging coverage map complete")
        addJestCoverage(coverageMap)
        console.log("Adding jest coverage map")

        console.log("Adding reporters...")
        mainReporter.addAll(["text", "json", "html", "lcov"])
        console.log("Writing code coverage map...")
        mainReporter.write(coverageMap, {})
        console.log("Complete!")
    })
}

module.exports = Coverage
