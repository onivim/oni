import * as assert from "assert"
import * as sinon from "sinon"

import { NeovimScreen } from "../../src/neovim/Screen"

describe("Screen", () => {
    describe("getCharacterWidth", () => {
        it("should return 1 for ① when editor.useEastAsianWidth is false", () => {
            // Mock configulation
            const configulation = {
                getValue: sinon.stub().returns(false),
            }
            // Instantiate
            const screen = new NeovimScreen(configulation as any)
            // Test getCharacterWidth()
            const characterWidth = screen.getCharacterWidth("①")
            assert.strictEqual(characterWidth, 1)
        })

        it("should return 2 for ① when editor.useEastAsianWidth is true", () => {
            // Mock configulation
            const configulation = {
                getValue: sinon.stub().returns(true),
            }
            // Instantiate
            const screen = new NeovimScreen(configulation as any)
            // Test getCharacterWidth()
            const characterWidth = screen.getCharacterWidth("①")
            assert.strictEqual(characterWidth, 2)
        })
    })
})
