import * as assert from "assert"

import * as Oni from "oni-api"

import { createStore, ISneakInfo } from "./../../../src/Services/Sneak/SneakStore"

const createTestSneak = (
    callback: () => void,
    x: number = 1,
    y: number = 1,
    width: number = 10,
    height: number = 10,
): ISneakInfo => {
    return {
        rectangle: Oni.Shapes.Rectangle.create(x, y, width, height),
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

        store.dispatch({ type: "START", width: 100, height: 100 })
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

    it("ADD_SNEAKS that are offscreen are not added", () => {
        const store = createStore()

        const normalSneak = createTestSneak(null, 2, 2, 10, 10)
        const offscreenSneak = createTestSneak(null, 101, 101, 10, 10)

        const sneaksRound1 = [normalSneak, offscreenSneak]

        store.dispatch({ type: "START", width: 100, height: 100 })
        store.dispatch({
            type: "ADD_SNEAKS",
            sneaks: sneaksRound1,
        })

        const state = store.getState()
        assert.strictEqual(state.sneaks.length, 1, "Validate only one sneak was added")
        assert.strictEqual(state.sneaks[0].rectangle.x, 2, "Validate the correct sneak was added")
    })
})
