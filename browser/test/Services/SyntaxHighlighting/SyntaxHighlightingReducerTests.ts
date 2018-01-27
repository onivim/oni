import * as assert from "assert"

import * as SyntaxHighlighting from "./../../../src/Services/SyntaxHighlighting"

describe("SyntaxHighlightingReducer", () => {
    describe("linesReducer", () => {
        describe("SYNTAX_UPDATE_BUFFER", () => {
            it("sets buffer lines if they don't exist yet", () => {
                const originalState: SyntaxHighlighting.SyntaxHighlightLines = {}

                const updateBufferAction: SyntaxHighlighting.ISyntaxHighlightAction = {
                    type: "SYNTAX_UPDATE_BUFFER",
                    extension: "ts",
                    language: "any",
                    bufferId: "1",
                    lines: ["line1", "line2"],
                }

                const newState = SyntaxHighlighting.linesReducer(originalState, updateBufferAction)

                assert.deepEqual(newState["0"], {
                    line: "line1",
                    dirty: true,
                    ruleStack: null,
                    tokens: [],
                })

                assert.deepEqual(newState["1"], {
                    line: "line2",
                    dirty: true,
                    ruleStack: null,
                    tokens: [],
                })
            })

            it("only sets changed lines to dirty", () => {
                const originalState: SyntaxHighlighting.SyntaxHighlightLines = {
                    "0": {
                        ruleStack: null,
                        tokens: [],
                        line: "line1",
                        dirty: false,
                    },
                    "1": {
                        ruleStack: null,
                        tokens: [],
                        line: "line2",
                        dirty: false,
                    },
                }

                const updateBufferAction: SyntaxHighlighting.ISyntaxHighlightAction = {
                    type: "SYNTAX_UPDATE_BUFFER",
                    extension: "ts",
                    language: "any",
                    bufferId: "1",
                    lines: ["line1", "line2_update"],
                }

                const newState = SyntaxHighlighting.linesReducer(originalState, updateBufferAction)

                assert.deepEqual(newState["0"], {
                    ruleStack: null,
                    tokens: [],
                    line: "line1",
                    dirty: false,
                })

                assert.deepEqual(newState["1"], {
                    ruleStack: null,
                    tokens: [],
                    line: "line2_update",
                    dirty: true,
                })
            })
        })
    })
})
