import * as assert from "assert"
import { CompletionItem } from "vscode-languageserver-types"

import { filterCompletionOptions } from "../../../src/Services/Completion/CompletionSelectors"

describe("filterCompletionOptions", () => {
    it("strips duplicates and sorts in order of abbreviation=>label=>sortText", () => {
        const item1: CompletionItem = {
            label: "mock duplicate",
            detail: "mock detail",
            sortText: "c",
        }
        const item2: CompletionItem = {
            label: "mock duplicate",
            detail: "mock detail",
            sortText: "b",
        }
        const item3: CompletionItem = {
            label: "mock duplicate",
            detail: "mock not duplicate detail",
            sortText: "a",
        }
        const item4: CompletionItem = {
            label: "maaaaoaaaacaaaak abbreviation",
        }
        const item5: CompletionItem = {
            label: "mock cherry",
            filterText: "mock cherry",
        }
        const item6: CompletionItem = {
            label: "mock cherry",
            filterText: "mock banana",
        }
        const item7: CompletionItem = {
            label: "mock apple",
        }
        const item8: CompletionItem = {
            label: "doesnt match",
        }
        const item9: CompletionItem = {
            label: "mock apple",
            filterText: "doesnt match either",
        }
        const items: CompletionItem[] = [
            item1,
            item2,
            item3,
            item4,
            item5,
            item6,
            item7,
            item8,
            item9,
        ]

        const filteredItems = filterCompletionOptions(items, "mock")

        assert.deepStrictEqual(filteredItems, [item7, item6, item5, item3, item2, item4])
    })
})
