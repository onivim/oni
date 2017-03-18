import * as assert from "assert"

import * as jsdom from "jsdom"

import * as Actions from "./../../src/actions"

import { IncrementalDeltaRegionTracker } from "./../../src/DeltaRegionTracker"

import * as DOMRenderer from "./../../src/Renderer/DOMRenderer"
import { IElementFactory } from "./../../src/Renderer/ElementFactory"
import { NeovimScreen } from "./../../src/Screen"

describe("DOMRenderer", () => {

    describe("core rendering", () => {
        let deltaRegionTracker: IncrementalDeltaRegionTracker
        let screen: NeovimScreen
        let renderer: DOMRenderer.DOMRenderer
        let document: HTMLDocument
        let editorElement: HTMLDivElement
        let elementFactory: IElementFactory

        beforeEach(() => {
            deltaRegionTracker = new IncrementalDeltaRegionTracker()
            screen = new NeovimScreen(deltaRegionTracker)
            document = jsdom.jsdom("")

            editorElement = document.createElement("div")
            elementFactory = new TestElementFactory(editorElement, document)
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

        it("breaks up spans with whitespace", () => {

            screen.dispatch(Actions.createCursorGotoAction(0, 0))
            screen.dispatch(Actions.setHighlight(false, false, false, false, false, 1, 1))
            screen.dispatch(Actions.put(["=", " ", "="]))

            renderer.update(screen, deltaRegionTracker)

            assert.strictEqual(editorElement.children.length, 3)
        })

        describe.only("multibyte characters", () => {
            it("breaks up spans with multibyte characters", () => {
                // Multibyte characters are always sent from Neovim with an extra whitespace successor
                screen.dispatch(Actions.put(["한", "",  "한", "", "한", "", "한", ""]))

                renderer.update(screen, deltaRegionTracker)

                assert.strictEqual(editorElement.children.length, 4)
            })

            it("breaks up spans with mixed characters", () => {
                // Multibyte characters are always sent from Neovim with an extra whitespace successor
                screen.dispatch(Actions.put(["a", "한", "", "b", "한", "", "한", "", "c", "d"]))

                renderer.update(screen, deltaRegionTracker)

                assert.strictEqual(editorElement.children.length, 6)
            })
        })
    })
})

export class TestElementFactory implements IElementFactory {

    private _editorElement: HTMLDivElement
    private _document: HTMLDocument

    constructor(editorElement: HTMLDivElement, document: HTMLDocument) {
        this._editorElement = editorElement
        this._document = document
    }

    public getElement(): HTMLSpanElement {
        const elem = this._document.createElement("span")
        this._editorElement.appendChild(elem)
        return elem
    }

    public recycle(element: HTMLSpanElement): void {
        element.remove()
    }
}
