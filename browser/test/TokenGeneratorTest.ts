import * as assert from "assert"
import getTokens, {
    IGrammarPerLine,
    IGrammarTokens,
} from "./../src/Services/SyntaxHighlighting/TokenGenerator"

describe("Token Generator function test", async () => {
    const testString = "function() { a + b }"
    let tokens: IGrammarPerLine
    let firstLine: IGrammarTokens

    before(async () => {
        tokens = await getTokens({ language: "typescript", ext: ".ts", line: testString })
        // FIXME there is a dependency on the editorManager which breaks the tests :SS
        firstLine = tokens[0]
    })

    it("Should create a map with the line as the key and should have a tokens array", () => {
        assert.ok(Array.isArray(firstLine.tokens))
    })

    it(`Should have a line property which should equal the original string`, () => {
        assert.ok(firstLine.line === testString)
    })

    it("Should have a ruleStack property", () => {
        assert.ok(firstLine.ruleStack)
    })
})
