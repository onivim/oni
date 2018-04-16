/**
 * NeovimMarksTest.ts
 */

import * as assert from "assert"

import { parseMarkLine } from "./../../src/neovim/NeovimMarks"

describe("NeovimMarks", () => {
    describe("parseMarkLine", () => {
        it("parses a simple line", () => {
            const line = "    A   1 10 some Text"

            const markInfo = parseMarkLine(line)

            assert.strictEqual(markInfo.line, 1)
            assert.strictEqual(markInfo.column, 10)
            assert.strictEqual(markInfo.mark, "A")
            assert.strictEqual(markInfo.global, true)
            assert.strictEqual(markInfo.text, "some Text")
        })
    })
})
