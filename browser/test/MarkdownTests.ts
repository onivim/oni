import * as assert from "assert"
import { StackElement } from "vscode-textmate"
import * as markdown from "./../../browser/src/Editor/NeovimEditor/markdown"

describe("Markdown Conversion Functions", () => {
    it("Scopes to string fn should correctly convert scopes to classnames", () => {
        const className = markdown.scopesToString(["token.scope.extension"])
        assert.ok(className === "token-scope")
    })

    it("Scopes to string Should return null if passed an falsy", () => {
        const nullArg = markdown.scopesToString(null)
        assert.ok(!nullArg)
    })

    it("Escape RegExp function should add an escape character to all banned chars", () => {
        const stringForRegex = "*apple^"
        const escaped = markdown.escapeRegExp(stringForRegex)
        // prettier-ignore
        assert.ok(escaped === "\\*apple\\^")
    })
    it("Escape RegExp function should NOT add an escape character to the | or - characters", () => {
        // NOTE token names include either so if they are escaped the token matching will fail
        const stringForRegex = "apple-tree|pineapple"
        const notEscaped = markdown.escapeRegExp(stringForRegex)
        assert.ok(notEscaped === "apple-tree|pineapple")
    })

    it("Create container function should wrap given text in a paragraph tag", () => {
        const wrapped = markdown.createContainer("p", "this is a paragraph")
        assert.ok(wrapped === `<p class="marked-paragraph">this is a paragraph</p>`)
    })

    it("Create container function should wrap given text in a pre element with a code block", () => {
        const wrapped = markdown.createContainer("pre", "this is code")
        assert.ok(wrapped === `<pre class="marked-pre">this is code</pre>`)
    })

    it("Should match tokens correctly and wrap a token in a span with the correct class", () => {
        const test = "eight"
        const token = [
            {
                line: test,
                ruleStack: {} as StackElement,
                tokens: [
                    {
                        scopes: ["test.scope.tsx"],
                        range: { start: { character: 0, line: 0 }, end: { character: 5, line: 0 } },
                    },
                ],
            },
        ]
        const tag = markdown.renderWithClasses({ tokens: token, text: test, container: "p" })
        assert.ok(
            tag.replace("\n", "") ===
                `<p class="marked-paragraph"><span class="marked test-scope">eight</span></p>`,
        )
    })
    it("Should match several tokens correctly and wrap a token in a span with the correct class", () => {
        const tokens = [
            {
                line: "React HTMLElement",
                ruleStack: {} as StackElement,
                tokens: [
                    {
                        scopes: ["react.js.tsx"],
                        range: { start: { character: 0, line: 0 }, end: { character: 5, line: 0 } },
                    },
                    {
                        scopes: ["stack.element.tsx"],
                        range: {
                            start: { character: 6, line: 0 },
                            end: { character: 17, line: 0 },
                        },
                    },
                ],
            },
        ]
        const tag = markdown.renderWithClasses({
            tokens,
            text: "React HTMLElement",
            container: "code",
        })
        // Note Code block provides its own code tag so this should return just spans
        const expected = `<span class="marked react-js">React</span> <span class="marked stack-element">HTMLElement</span>`
            .replace("\n", "")
            .trim()

        assert.ok(tag.replace("\n", "").trim() === expected)
    })
})
