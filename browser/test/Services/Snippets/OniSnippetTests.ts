import * as assert from "assert"

import * as Snippets from "vscode-snippet-parser/lib"

import { getLineCharacterFromOffset, OniSnippet } from"./../../../src/Services/Snippets/OniSnippet"

const getTextmateSnippetFromString = (snippetString: string): Snippets.TextmateSnippet => {
    const parser = new Snippets.SnippetParser()
    const snippet = parser.parse(snippetString)
    return snippet
}

describe("getLineCharacterFromOffset", () => {
    it("handles single line case", () => {
        const lines = ["foo"]

        const result = getLineCharacterFromOffset(1, lines)
        assert.deepEqual(result, { line: 0, character: 1})
    })

    it("handles multi-line case", () => {
        const lines = ["foo", "bar"]

        // '4' instead of '3' because of the new line...
        const result = getLineCharacterFromOffset(4, lines)

        assert.deepEqual(result, { line: 1, character: 0 })
    })
})

describe("OniSnippet", () => {
    describe("getLines", () => {
        it("splits based on '\\n'", () => {
            const tmSnippet = getTextmateSnippetFromString("foo\nbar")
            const oniSnippet = new OniSnippet(tmSnippet)

            const lines = oniSnippet.getLines()

            assert.deepEqual(lines, ["foo", "bar"], "Validate lines are split correctly")
        })

        it("splits based on '\\r\\n'", () => {
            const tmSnippet = getTextmateSnippetFromString("foo\r\nbar")
            const oniSnippet = new OniSnippet(tmSnippet)

            const lines = oniSnippet.getLines()

            assert.deepEqual(lines, ["foo", "bar"], "Validate lines are split correctly")
        })
    })

    describe("getPlaceholders", () => {
        it("gets single placeholder", () => {
            const tmSnippet = getTextmateSnippetFromString("foo${1:index}")
            const oniSnippet = new OniSnippet(tmSnippet)

            const placeholders = oniSnippet.getPlaceholders()

            assert.deepEqual(placeholders[0], {
                index: 1,
                line: 0,
                character: 3,
                value: "index"
            })
        })

        it("gets multiple placeholders on different lines", () => {
            const tmSnippet = getTextmateSnippetFromString("foo${1:a}\nbar${2:b}")
            const oniSnippet = new OniSnippet(tmSnippet)

            const placeholders = oniSnippet.getPlaceholders()

            assert.deepEqual(placeholders[0], {
                index: 1,
                line: 0,
                character: 3,
                value: "a"
            })

            assert.deepEqual(placeholders[1], {
                index: 2,
                line: 1,
                character: 3,
                value: "b"
            })
        })
    })

    describe("setPlaceholder", () => {
        it("replaces placeholder in multiple positions", () => {
            const tmSnippet = getTextmateSnippetFromString("${1}${1}${1}")
            const oniSnippet = new OniSnippet(tmSnippet)

            oniSnippet.setPlaceholder(1, "test")

            assert.deepEqual(oniSnippet.getLines(), ["testtesttest"])

            oniSnippet.setPlaceholder(1, "test2")

            assert.deepEqual(oniSnippet.getLines(), ["test2test2test2"])
        })
    })
})
