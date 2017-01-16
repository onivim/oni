import * as assert from "assert"

import * as jsdom from "jsdom"

import { Grid } from "./../../src/Grid"
import * as DOMRenderer from "./../../src/Renderer/DOMRenderer"

describe("DOMRenderer", () => {

    describe("addOrCoalesceSpan", () => {

        it("should not combine spans that do not overlap", () => {
            const span1 = {
                startX: 1,
                endX: 2
            }

            const span2 = {
                startX: 3,
                endX: 4
            }

            const outputSpans = DOMRenderer.addOrCoalesceSpan([span1], span2)
            assert.strictEqual(outputSpans.length, 2)
            assert.deepEqual(outputSpans, [span1, span2])
        })

        it("should combine spans that do overlap", () => {
            const span1 = {
                startX: 1,
                endX: 2
            }

            const span2 = {
                startX: 1,
                endX: 3
            }

            const outputSpans = DOMRenderer.addOrCoalesceSpan([span1], span2)
            assert.strictEqual(outputSpans.length, 1)
            assert.deepEqual(outputSpans, [{ startX: 1, endX: 3 }])
        })

    })

    describe("getSpansToEdit", () => {
        let testDocument: any = null

        beforeEach(() => {
            testDocument = jsdom.jsdom("")
        })

        it("combines multiple sequential cells to a single span", () => {
            const grid = new Grid<DOMRenderer.ISpanElementInfo>()

            const cells = [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }]

            const spans = DOMRenderer.getSpansToEdit(grid, cells)

            const row = spans.get(1) || []
            assert.strictEqual(row.length, 1)
            assert.deepEqual(row, [{ startX: 1, endX: 4 }])

            var div = testDocument.createElement("div")
            testDocument.body.appendChild(div)
            console.log(testDocument.body.childNodes.length)
        })
    })
})

