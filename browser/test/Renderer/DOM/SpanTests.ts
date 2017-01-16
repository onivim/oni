import * as assert from "assert"

import * as jsdom from "jsdom"

import * as Actions from "./../../src/actions"

import { IncrementalDeltaRegionTracker } from "./../../src/DeltaRegionTracker"
import { Grid } from "./../../src/Grid"
import * as DOMRenderer from "./../../src/Renderer/DOMRenderer"
import { NeovimScreen } from "./../../src/Screen"

describe("DOMRenderer", () => {

    describe("core rendering", () => {
        let deltaRegionTracker: IncrementalDeltaRegionTracker
        let screen: NeovimScreen
        let renderer: DOMRenderer.DOMRenderer
        let document: HTMLDocument
        let editorElement: HTMLDivElement
        let elementFactory: DOMRenderer.IElementFactory

        beforeEach(() => {
            deltaRegionTracker = new IncrementalDeltaRegionTracker() 
            screen = new NeovimScreen(deltaRegionTracker)
            document = jsdom.jsdom("")

            editorElement = document.createElement("div")
            elementFactory = new TestElementFactory(document)
            renderer = new DOMRenderer.DOMRenderer()
            renderer.start(editorElement, elementFactory)
        })

        it("handles simple rendering case", () => {
            screen.dispatch(Actions.put(["="]))
            screen.dispatch(Actions.put(["="]))

            renderer.update(screen, deltaRegionTracker)
            assert.strictEqual(editorElement.children.length, 1)

            // Validate that, after rendering a new item, it is still
            // combined to the single span
            screen.dispatch(Actions.put(["="]))
            renderer.update(screen, deltaRegionTracker)
            assert.strictEqual(editorElement.children.length, 1)
        })

        it("handles changing color", () => {
            screen.dispatch(Actions.put(["="]))
            screen.dispatch(Actions.setHighlight(false, false, false, false, false, 100, 100))

            screen.dispatch(Actions.put(["="]))
            renderer.update(screen, deltaRegionTracker)

            // Since the second equals was a different color, we should see
            // a second span for it
            assert.strictEqual(editorElement.children.length, 2)
        })

        it("coalesces span with insert in middle", () => {
            screen.dispatch(Actions.createCursorGotoAction(0, 0))

            screen.dispatch(Actions.setHighlight(false, false, false, false, false, 1, 1))
            screen.dispatch(Actions.put(["="]))

            screen.dispatch(Actions.setHighlight(false, false, false, false, false, 2, 2))
            screen.dispatch(Actions.put(["="]))

            screen.dispatch(Actions.setHighlight(false, false, false, false, false, 1, 1))
            screen.dispatch(Actions.put(["="]))

            renderer.update(screen, deltaRegionTracker)
            assert.strictEqual(editorElement.children.length, 3)

            screen.dispatch(Actions.createCursorGotoAction(0, 1))
            screen.dispatch(Actions.setHighlight(false, false, false, false, false, 1, 1))
            screen.dispatch(Actions.put(["="]))

            renderer.update(screen, deltaRegionTracker)
            assert.strictEqual(editorElement.children.length, 1)
        })
    })

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

    describe("flattenSpansToArray", () => {
        it("simple test", () => {

            const output = DOMRenderer.flattenSpansToArray([{startX: 1, endX: 2}, {startX: 3, endX: 5}])
            assert.deepEqual(output, [null, true, false, true, true])
        })
    })

    describe("expandArrayToSpans", () => {
        it("simple test", () => {

            const input = [{startX: 1, endX: 2}, {startX: 3, endX: 5}]
            const array = DOMRenderer.flattenSpansToArray(input)
            const expanded = DOMRenderer.expandArrayToSpans(array)

            assert.deepEqual(expanded, input)
        })
    })

    describe("collapeSpans", () => {
        it("does not collapse spans that are not adjacent", () => {
            const spans = [{startX: 1, endX: 4}, {startX: 5, endX: 6}]
            const outSpans = DOMRenderer.collapseSpans(spans)

            assert.deepEqual(outSpans, spans)
        })

        it("does collapse spans that overlap", () => {
            const spans = [{startX: 1, endX: 4}, {startX: 3, endX: 5}]
            const outSpans = DOMRenderer.collapseSpans(spans)

            assert.deepEqual(outSpans, [{startX: 1, endX: 5}])

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

            const spans = DOMRenderer.getSpansToEdit(grid, cells, new TestElementFactory(testDocument))

            const row = spans.get(1) || []
            assert.strictEqual(row.length, 1)
            assert.deepEqual(row, [{ startX: 1, endX: 4 }])

            var div = testDocument.createElement("div")
            testDocument.body.appendChild(div)
            console.log(testDocument.body.childNodes.length)
        })
    })
})

export class TestElementFactory implements DOMRenderer.IElementFactory {

    private _document: HTMLDocument

    constructor(document: HTMLDocument) {
        this._document = document
    }

    public getElement(): HTMLSpanElement {
        return this._document.createElement("span")
    }

    public recycle(element: HTMLSpanElement): void {
        element.remove()
    }
}

