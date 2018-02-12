import * as assert from "assert"
import getTokens, {
    IGrammarPerLine,
    IGrammarTokens,
} from "./../src/Services/SyntaxHighlighting/TokenGenerator"
// import * as sinon from "sinon"

describe("Token Generator function test", async () => {
    const testString = "function() { a + b }"
    let tokens: IGrammarPerLine
    let firstLine: IGrammarTokens

    before(async () => {
        // FIXME there's a dependency on the Grammar loader and the absence of the JSON files
        // it loads ?mock the require
        tokens = await getTokens({ language: "typescript", extension: ".ts", line: testString })
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
