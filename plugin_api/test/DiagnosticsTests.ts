import * as assert from "assert"

import { Diagnostics } from "./../src/Diagnostics"
import { ISender } from "./../src/Sender"

describe("Diagnostics", () => {
    let diagnostics: Diagnostics
    let mockSender: MockSender

    beforeEach(() => {
        mockSender = new MockSender()
        diagnostics = new Diagnostics(mockSender)
    })

    it("sends errors for a file", () => {
        diagnostics.setErrors("test-plugin", "someFile.ts", [{
            lineNumber: 1,
            startColumn: 0,
            endColumn: 1,
            type: "error",
            text: "some error"
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
            text: "some error"
        }], "red")

        diagnostics.setErrors("test-plugin", "someFile.ts", [], "red")
        assert.strictEqual(mockSender.sentMessages.length, 2)
    })
})

class MockSender implements ISender {
    private _sentMessages: any[] = []
    private _sentErrors: any[] = []

    public get sentMessages(): any[] {
        return this._sentMessages
    }

    public get sentErrors(): any[] {
        return this._sentErrors
    }

    public send(type: string, originalEvent: any, payload: any): void {
        this._sentMessages.push({
            type,
            originalEvent,
            payload
        })
    }

    public sendError(type: string, originalEvent: any, error: string): void {
        this._sentErrors.push({
            type,
            originalEvent,
            error
        })
    }
}
