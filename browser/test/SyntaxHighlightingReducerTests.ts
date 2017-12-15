
import test from "ava"

import * as SyntaxHighlighting from "../src/Services/SyntaxHighlighting"

test("SYNTAX_UPDATE_BUFFER reducer action sets buffer lines if they don't exist yet", t => {
    const originalState: SyntaxHighlighting.SyntaxHighlightLines = {}

    const updateBufferAction: SyntaxHighlighting.ISyntaxHighlightAction = {
        type: "SYNTAX_UPDATE_BUFFER",
        extension: "ts",
        language: "any",
        bufferId: "1",
        lines: [
            "line1",
            "line2",
        ],
    }

    const newState = SyntaxHighlighting.linesReducer(originalState, updateBufferAction)

    t.deepEqual(newState["0"], {
        line: "line1",
        dirty: true,
        ruleStack: null,
        tokens: [],
    })

    t.deepEqual(newState["1"], {
        line: "line2",
        dirty: true,
        ruleStack: null,
        tokens: [],
    })
})

test("SYNTAX_UPDATE_BUFFER reducer action only sets changed lines to dirty", t => {
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
        lines: [
            "line1",
            "line2_update",
        ],
    }

    const newState = SyntaxHighlighting.linesReducer(originalState, updateBufferAction)

    t.deepEqual(newState["0"], {
        ruleStack: null,
        tokens: [],
        line: "line1",
        dirty: false,
    })

    t.deepEqual(newState["1"], {
        ruleStack: null,
        tokens: [],
        line: "line2_update",
        dirty: true,
    })
})

