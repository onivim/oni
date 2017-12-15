
import test from "ava"

import * as Span from "../src/Renderer/Span"

test("Span.flattenSpansToArray() simple test", t => {
    const output = Span.flattenSpansToArray([{startX: 1, endX: 2}, {startX: 3, endX: 5}])
    t.deepEqual(output, [null, true, false, true, true])
})

test("Span.expandArrayToSpans() simple test", t => {

    const input = [{startX: 1, endX: 2}, {startX: 3, endX: 5}]
    const array = Span.flattenSpansToArray(input)
    const expanded = Span.expandArrayToSpans(array)

    t.deepEqual(expanded, input)
})

test("Span.collapseSpans() does not collapse spans that are not adjacent", t => {
    const spans = [{startX: 1, endX: 4}, {startX: 5, endX: 6}]
    const outSpans = Span.collapseSpans(spans)

    t.deepEqual(outSpans, spans)
})

test("Span.collapseSpans() does collapse spans that overlap", t => {
    const spans = [{startX: 1, endX: 4}, {startX: 3, endX: 5}]
    const outSpans = Span.collapseSpans(spans)

    t.deepEqual(outSpans, [{startX: 1, endX: 5}])
})
