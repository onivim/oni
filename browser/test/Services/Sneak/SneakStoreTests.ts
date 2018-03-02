import * as assert from "assert"

import * as Oni from "oni-api"

import { createStore, ISneakInfo } from "./../../../src/Services/Sneak/SneakStore"

const createTestSneak = (callback: () => void): ISneakInfo => {
    return {
        rectangle: Oni.Shapes.Rectangle.create(0, 0, 0, 0),
        callback,
    }
}

describe("SneakStore", () => {
    it("ADD_SNEAKS is ignored if not active", () => {
        const store = createStore()

        const sneaks = [createTestSneak(null), createTestSneak(null)]

        store.dispatch({
            type: "END",
        })

        store.dispatch({
            type: "ADD_SNEAKS",
            sneaks,
        })

        const state = store.getState()

        assert.deepEqual(state.sneaks, [])
    })

    it("Multiple ADD_SNEAKS actions are correctly labelled", () => {
        const store = createStore()

        const sneaksRound1 = [createTestSneak(null), createTestSneak(null)]

        store.dispatch({ type: "START" })
        store.dispatch({
            type: "ADD_SNEAKS",
            sneaks: sneaksRound1,
        })

        const sneaksRound2 = [createTestSneak(null), createTestSneak(null)]

        store.dispatch({
            type: "ADD_SNEAKS",
            sneaks: sneaksRound2,
        })

        const keys = store.getState().sneaks.map(s => s.triggerKeys)

        assert.deepEqual(keys, ["AA", "AB", "AC", "AD"])
    })
})
