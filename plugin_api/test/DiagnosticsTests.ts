import * as assert from "assert"

import { Diagnostics } from "./../src/Diagnostics"
import { ISender } from "./../src/Sender"

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

describe("Diagnostics", () => {
    let diagnostics: Diagnostics;
    let mockSender: ISender;

    beforeEach(() => {
        mockSender = new MockSender();
        diagnostics = new Diagnostics(mockSender);
    });

    it("sends errors for a file", () => {
        assert.ok(false);
    });

    it("does not send errors for a file if there have never been any errors", () => {
        assert.ok(false);
    });

    it("does send empty errors array, if there have been errors previously", () => {
        assert.ok(false);
    });
})

