/**
 * CompletionProvidersTests.ts
 */

import * as assert from "assert"

import * as types from "vscode-languageserver-types"

import { CompletionProviders, ICompletionsRequestor } from "./../../../src/Services/Completion"

export class MockCompletionsRequestor implements ICompletionsRequestor {
    constructor(private _hardcodedCompletions: types.CompletionItem[]) {}

    public async getCompletions(
        fileLanguage: string,
        filePath: string,
        line: number,
        column: number,
    ): Promise<types.CompletionItem[]> {
        return this._hardcodedCompletions
    }

    public async getCompletionDetails(
        fileLanguage: string,
        filePath: string,
        completionItem: types.CompletionItem,
    ): Promise<types.CompletionItem> {
        return null
    }
}

const createCompletionItem = (item: string): types.CompletionItem => ({
    label: item,
    detail: item,
})

describe("CompletionProvider", () => {
    it("combines completions from multiple providers", async () => {
        const provider1 = new MockCompletionsRequestor([
            createCompletionItem("a"),
            createCompletionItem("b"),
        ])
        const provider2 = new MockCompletionsRequestor([
            createCompletionItem("c"),
            createCompletionItem("d"),
        ])

        const completionProviders = new CompletionProviders()
        completionProviders.registerCompletionProvider("provider1", provider1)
        completionProviders.registerCompletionProvider("provider2", provider2)

        const result = await completionProviders.getCompletions("lang", "file", 0, 0)

        const resultItems = result.map(i => i.label)

        assert.strictEqual(result.length, 4)
        assert.deepEqual(resultItems, ["a", "b", "c", "d"])
    })

    it("handles case where one completion provider returns null", async () => {
        const provider1 = new MockCompletionsRequestor(null)
        const provider2 = new MockCompletionsRequestor([
            createCompletionItem("c"),
            createCompletionItem("d"),
        ])

        const completionProviders = new CompletionProviders()
        completionProviders.registerCompletionProvider("provider1", provider1)
        completionProviders.registerCompletionProvider("provider2", provider2)

        const result = await completionProviders.getCompletions("lang", "file", 0, 0)

        const resultItems = result.map(i => i.label)

        assert.strictEqual(result.length, 2)
        assert.deepEqual(resultItems, ["c", "d"])
    })
})
