import * as assert from "assert"

import * as types from "vscode-languageserver-types"

import * as Capabilities from "./../../../src/Plugins/Api/Capabilities"
import { IPluginChannel } from "./../../../src/Plugins/Api/Channel"
import { Diagnostics } from "./../../../src/Plugins/Api/Diagnostics"

describe("Diagnostics", () => {
    let diagnostics: Diagnostics
    let mockChannel: MockPluginChannel

    beforeEach(() => {
        mockChannel = new MockPluginChannel()
        diagnostics = new Diagnostics(mockChannel)
    })

    it("sends errors for a file", () => {
        diagnostics.setErrors("test-plugin", "someFile.ts", [{
            range: types.Range.create(1, 0, 1, 1),
            severity: types.DiagnosticSeverity.Error,
            message: "some error",
        }])

        assert.strictEqual(mockChannel.sentMessages.length, 1)
    })

    it("does not send errors for a file if there have never been any errors", () => {
        diagnostics.setErrors("test-plugin", "someFile.ts", [])

        assert.strictEqual(mockChannel.sentMessages.length, 0)
    })

    it("does send empty errors array, if there have been errors previously", () => {
        diagnostics.setErrors("test-plugin", "someFile.ts", [{
            range: types.Range.create(1, 0, 1, 1),
            severity: types.DiagnosticSeverity.Error,
            message: "some error",
        }])

        diagnostics.setErrors("test-plugin", "someFile.ts", [])
        assert.strictEqual(mockChannel.sentMessages.length, 2)
    })
})

class MockPluginChannel implements IPluginChannel {
    private _sentMessages: any[] = []
    private _sentErrors: any[] = []
    private _metadata: Capabilities.IPluginMetadata

    public get metadata(): Capabilities.IPluginMetadata {
        return this._metadata
    }

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
            payload,
        })
    }

    public sendError(type: string, originalEvent: any, error: string): void {
        this._sentErrors.push({
            type,
            originalEvent,
            error,
        })
    }

    public onRequest(requestCallback: (arg: any) => void): void {
        noop(requestCallback)
    }
}

function noop(...args: any[]): void {

    if (args) {
        // tslint:disable-line no-empty
    }
}
