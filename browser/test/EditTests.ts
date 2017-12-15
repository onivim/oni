
import test from "ava"

import * as types from "vscode-languageserver-types"

import { sortTextEdits } from "../src/Services/Language/Edits"

test("sortTextEdits() sorts descending by lines", t => {

    const rangeLine1 = types.Range.create(1, 0, 1, 0)
    const rangeLine2 = types.Range.create(2, 0, 2, 0)

    const edit1 = types.TextEdit.del(rangeLine1)
    const edit2 = types.TextEdit.del(rangeLine2)

    const ranges = [edit1, edit2]

    const sortedRanges = sortTextEdits(ranges)

    t.deepEqual(sortedRanges, [edit2, edit1])
})

test("sortTextEdits() sorts descending inside lines", t => {
    const rangeLine1 = types.Range.create(1, 1, 1, 5)
    const rangeLine2 = types.Range.create(1, 10, 1, 15)

    const edit1 = types.TextEdit.del(rangeLine1)
    const edit2 = types.TextEdit.del(rangeLine2)

    const ranges = [edit1, edit2]
    const sortedRanges = sortTextEdits(ranges)

    t.deepEqual(sortedRanges, [edit2, edit1])
})

test("sortTextEdits() sorts first by lines, then by characters", t => {

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

    t.deepEqual(sortedEdits, [edit4, edit3, edit2, edit1])
})
