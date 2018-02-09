/**
 * TokenColorsTest
 */

import * as assert from "assert"

import { TokenColors } from "./../../src/Services/TokenColors"

describe("TokenColors", () => {
    it("fails", () => {
        const tokenColors = new TokenColors(null, null)
        assert.ok(tokenColors.tokenColors)
        assert.ok(false)
    })
})
