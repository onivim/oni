/**
 * SnippetProviderTests.ts
 */

import * as assert from "assert"
import * as os from "os"

import { loadSnippetsFromText } from "./../../../src/Services/Snippets/SnippetProvider"


const ArraySnippet = `
{
    "if": {
        "prefix": "test",
        "body": [
            "line1",
            "line2"
        ],
        "description": "Code snippet for an if statement"
    }
}
`

const SingleLineSnippet = `
{
    "if": {
        "prefix": "test",
        "body": "line1",
        "description": "Code snippet for an if statement"
    }
}
`

describe("SnippetProviderTests", () => {
    describe("loadSnippetsFromText", () => {
        it("parses a basic snippet", async () => {
            const [parsedArraySnippet] = loadSnippetsFromText(ArraySnippet)

            assert.strictEqual(parsedArraySnippet.body, "line1" + os.EOL + "line2", "Validate body was parsed correctly")
        })

        it("parses single-line snippet", async () => {
            
            const [parsedSingleLineSnippet] = loadSnippetsFromText(SingleLineSnippet)

            assert.strictEqual(parsedSingleLineSnippet.body, "line1", "Validate body was parsed correctly")
        })
    })
})
