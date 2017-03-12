import * as assert from "assert"

import * as jsdom from "jsdom"

import { IncrementalDeltaRegionTracker } from "./../../src/DeltaRegionTracker"
import { NeovimScreen } from "./../../src/Screen"

import * as TokenRenderer from "./../../src/Renderer/TokenRenderer"

describe("TokenRenderer", () => {
    let deltaRegionTracker: IncrementalDeltaRegionTracker
    let screen: NeovimScreen
    let document: HTMLDocument

    beforeEach(() => {
        deltaRegionTracker = new IncrementalDeltaRegionTracker()
        screen = new NeovimScreen(deltaRegionTracker)
        document = jsdom.jsdom("")
    })

    describe("getRendererForCell", () => {

        it("fails", () => {
            const renderer = TokenRenderer.getRendererForCell(0, 0, null, screen, null)
            assert.ok(renderer.canHandleCell(null))
        })
    })
})
