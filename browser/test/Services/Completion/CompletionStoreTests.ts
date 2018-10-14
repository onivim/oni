import * as assert from "assert"
import * as _ from "lodash"

import { DefaultCompletionResults } from "./../../../src/Services/Completion/CompletionState"
import { completionResultsReducer } from "./../../../src/Services/Completion/CompletionStore"

describe("completionResultsReducer", () => {
    let oldState: any

    beforeEach(() => {
        oldState = _.cloneDeep(DefaultCompletionResults)
    })

    describe("GET_COMPLETION_ITEM_DETAILS_RESULT", () => {
        beforeEach(() => {
            oldState.completions = [
                { label: "other" },
                { label: "matchme", detail: "matchme(signature)" },
                { label: "matchme", detail: "other(signature)" },
                { label: "matchme" },
            ]
        })

        it("updates relevant items with detailed version by label field", () => {
            const completionItemWithDetails = {
                label: "matchme",
            }

            const newState = completionResultsReducer(oldState, {
                type: "GET_COMPLETION_ITEM_DETAILS_RESULT",
                completionItemWithDetails,
            })

            assert.deepStrictEqual(newState, {
                ...oldState,
                completions: [
                    { label: "other" },
                    completionItemWithDetails,
                    completionItemWithDetails,
                    completionItemWithDetails,
                ],
            })
        })

        it("updates relevant items with detailed version by detail field", () => {
            const completionItemWithDetails = {
                label: "matchme",
                detail: "matchme(signature)",
            }
            const newState = completionResultsReducer(oldState, {
                type: "GET_COMPLETION_ITEM_DETAILS_RESULT",
                completionItemWithDetails,
            })

            assert.deepStrictEqual(newState, {
                ...oldState,
                completions: [
                    { label: "other" },
                    completionItemWithDetails,
                    { label: "matchme", detail: "other(signature)" },
                    completionItemWithDetails,
                ],
            })
        })
    })
})
