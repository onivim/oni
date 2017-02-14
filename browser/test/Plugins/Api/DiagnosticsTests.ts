import * as assert from "assert"

import { Diagnostics } from "./../../../src/Plugins/Api/Diagnostics"
import { IPluginChannel } from "./../../../src/Plugins/Api/Channel"

describe("Diagnostics", () => {
    let diagnostics: Diagnostics
    let mockChannel: IPluginChannel

    beforeEach(() => {
        diagnostics = new Diagnostics(mockChannel)
    })

    it("sends errors for a file", () => {
        diagnostics.setErrors("test-plugin", "someFile.ts", [{
            lineNumber: 1,
            startColumn: 0,
            endColumn: 1,
            type: "error",
            text: "some error",
        }], "red")

        assert.strictEqual(mockSender.sentMessages.length, 1)
    })

    it("does not send errors for a file if there have never been any errors", () => {
        diagnostics.setErrors("test-plugin", "someFile.ts", [], "red")

        assert.strictEqual(mockSender.sentMessages.length, 0)
    })

    it("does send empty errors array, if there have been errors previously", () => {
        diagnostics.setErrors("test-plugin", "someFile.ts", [{
            lineNumber: 1,
            startColumn: 0,
            endColumn: 1,
            type: "error",
            text: "some error",
        }], "red")

        diagnostics.setErrors("test-plugin", "someFile.ts", [], "red")
        assert.strictEqual(mockSender.sentMessages.length, 2)
    })
})
