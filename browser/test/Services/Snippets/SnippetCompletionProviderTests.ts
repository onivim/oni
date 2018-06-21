/**
 * SnippetCompletionProviderTests.ts
 */

import * as assert from "assert"

import * as Oni from "oni-api"

import { SnippetCompletionProvider } from "./../../../src/Services/Snippets/SnippetCompletionProvider"

export class MockSnippetManager {
    public get isSnippetActive(): boolean {
        return false
    }

    public async getSnippetsForLanguage(language: string): Promise<Oni.Snippets.Snippet[]> {
        const snippets: Oni.Snippets.Snippet[] = [
            {
                prefix: "test",
                body: "foobar",
                description: "test snippet",
            },
        ]
        return snippets
    }
}

describe("SnippetCompletionProviderTests", () => {
    it("returns empty array if no meets", async () => {
        const snippetManager: any = new MockSnippetManager()
        const snippetCompletionProvider = new SnippetCompletionProvider(snippetManager)

        const snippets = await snippetCompletionProvider.getCompletions({
            language: "test",
            filePath: "test",
            line: 0,
            column: 0,
            meetCharacter: "",
            textMateScopes: [],
        })

        assert.strictEqual(snippets.length, 0)
    })
})
