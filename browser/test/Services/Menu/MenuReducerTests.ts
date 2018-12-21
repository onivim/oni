import * as assert from "assert"
import * as sinon from "sinon"

import { createReducer } from "../../../src/Services/Menu/MenuReducer"
import { createDefaultState } from "../../../src/Services/Menu/MenuState"

describe("MenuReducer", () => {
    let reducer: any
    let oldState: any

    beforeEach(() => {
        reducer = createReducer<any, any>()
        oldState = createDefaultState<any, any>()
        oldState.menu = {}
    })

    describe("popupMenuReducer", () => {
        describe("FILTER_MENU", () => {
            let filteredOptions: any
            let filterFunction: any

            beforeEach(() => {
                filteredOptions = {}
                filterFunction = sinon.stub().returns(filteredOptions)
                oldState.menu.filterFunction = filterFunction
            })

            it("resets selectedIndex to zero", () => {
                oldState.menu.selectedIndex = 123

                const newState = reducer(oldState, {
                    type: "FILTER_MENU",
                    payload: { filter: "mock filter" },
                })

                assert.deepStrictEqual(newState, {
                    ...oldState,
                    menu: {
                        filter: "mock filter",
                        filterFunction,
                        filteredOptions,
                        selectedIndex: 0,
                    },
                })
            })
        })
    })
})
