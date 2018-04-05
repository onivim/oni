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
                    version: 1,
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

            it("sets lines with a different buffer version to dirty", () => {
                const originalState: SyntaxHighlighting.SyntaxHighlightLines = {
                    "0": {
                        ruleStack: null,
                        tokens: [],
                        line: "line1",
                        dirty: false,
                        version: 1,
                    },
                    "1": {
                        ruleStack: null,
                        tokens: [],
                        line: "line2",
                        dirty: false,
                        version: 0,
                    },
                }

                const updateBufferAction: SyntaxHighlighting.ISyntaxHighlightAction = {
                    type: "SYNTAX_UPDATE_BUFFER",
                    extension: "ts",
                    language: "any",
                    bufferId: "1",
                    lines: ["line1", "line2_update"],
                    version: 1,
                }

                const newState = SyntaxHighlighting.linesReducer(originalState, updateBufferAction)

                assert.deepEqual(newState["0"], {
                    ruleStack: null,
                    tokens: [],
                    line: "line1",
                    dirty: false,
                    version: 1,
                })

                assert.deepEqual(newState["1"], {
                    ruleStack: null,
                    tokens: [],
                    line: "line2_update",
                    dirty: true,
                    version: 0,
                })
            })
        })
    })
})
