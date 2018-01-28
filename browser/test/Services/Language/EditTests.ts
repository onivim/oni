import * as assert from "assert"

import * as types from "vscode-languageserver-types"

import { sortTextEdits } from "./../../../src/Services/Language/Edits"

describe("sortTextEdits", () => {
    it("sorts descending by lines", () => {
        const rangeLine1 = types.Range.create(1, 0, 1, 0)
        const rangeLine2 = types.Range.create(2, 0, 2, 0)

        const edit1 = types.TextEdit.del(rangeLine1)
        const edit2 = types.TextEdit.del(rangeLine2)

        const ranges = [edit1, edit2]

        const sortedRanges = sortTextEdits(ranges)

        assert.deepEqual(sortedRanges, [edit2, edit1])
    })

    it("sorts descending inside lines", () => {
        const rangeLine1 = types.Range.create(1, 1, 1, 5)
        const rangeLine2 = types.Range.create(1, 10, 1, 15)

        const edit1 = types.TextEdit.del(rangeLine1)
        const edit2 = types.TextEdit.del(rangeLine2)

        const ranges = [edit1, edit2]
        const sortedRanges = sortTextEdits(ranges)

        assert.deepEqual(sortedRanges, [edit2, edit1])
    })

    it("sorts first by lines, then by characters", () => {
        const rangeLine1 = types.Range.create(1, 1, 1, 5)
        const rangeLine2 = types.Range.create(1, 10, 1, 15)
        const rangeLine3 = types.Range.create(2, 1, 2, 5)
        const rangeLine4 = types.Range.create(2, 10, 2, 15)

        const edit1 = types.TextEdit.del(rangeLine1)
        const edit2 = types.TextEdit.del(rangeLine2)
        const edit3 = types.TextEdit.del(rangeLine3)
        const edit4 = types.TextEdit.del(rangeLine4)

        const edits = [edit1, edit2, edit3, edit4]
        const sortedEdits = sortTextEdits(edits)

        assert.deepEqual(sortedEdits, [edit4, edit3, edit2, edit1])
    })
})
