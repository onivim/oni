/**
 * FinderProcessTests.ts
 */

import * as assert from "assert"
import { extractSplitData } from "../../../src/Services/QuickOpen/FinderProcess"

describe("extractSplitData", () => {
    it("Splits the data by the delimiter", () => {
        const data = "file1\nfile2\nfile3\n"
        const delimiter = "\n"
        const lastRemnant = ""

        const { splitData } = extractSplitData(data, delimiter, lastRemnant)

        assert.equal(splitData.length, 3)
    })

    it("Ignores empty input", () => {
        const data = ""
        const delimiter = "\n"
        const lastRemnant = ""

        const { didExtract } = extractSplitData(data, delimiter, lastRemnant)

        assert.equal(didExtract, false)
    })

    it("Returns a remnant if the data doesn't end with the delimiter", () => {
        const data = "file1\nfile2"
        const delimiter = "\n"
        const lastRemnant = ""

        const { remnant, splitData } = extractSplitData(data, delimiter, lastRemnant)

        assert.equal(remnant, "file2")
        assert.equal(splitData.length, 1)
    })

    it("Returns an empty remnant if the data does end with the delimiter", () => {
        const data = "file1\nfile2\n"
        const delimiter = "\n"
        const lastRemnant = ""

        const { remnant } = extractSplitData(data, delimiter, lastRemnant)

        assert.equal(remnant, "")
    })

    it("Prepends the last remnant if there was one", () => {
        const data = "e1\nfile2\n"
        const delimiter = "\n"
        const lastRemnant = "fil"

        const { splitData } = extractSplitData(data, delimiter, lastRemnant)

        assert.equal(splitData.length, 2)
        assert.equal(splitData[0], "file1")
    })
})
