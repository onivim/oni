/**
 * KeyBindingTreeTests.ts
 */

import * as assert from "assert"

import * as KeyBindingTree from "./../../../src/Services/InputManager/KeyBindingTree"

describe("KeyBindingTreeTests", () => {
    describe("create", () => {
        it("has no bindings or children", () => {
            const kbt = KeyBindingTree.create()

            assert.deepEqual(kbt.children, {})
            assert.deepEqual(kbt.bindings, [])
        })
    })

    describe("isPotentialChord", () => {
        it("returns false for unbound key", () => {
            assert.ok(false)
        })

        it("returns true if part of chord, but false if complete", () => {
            assert.ok(false)
        })
    })

    describe("getKeyBindingsForChord", () => {
        it("returns empty array if no bindings", () => {
            assert.ok(false)
        })

        it("gives value for single item chord", () => {
            assert.ok(false)
        })
    })

    describe("isTerminal", () => {
        it("returns true for single item with no chorded bindings", () => {
            assert.ok(false)
        })

        it("returns false for key that has potential bindings", () => {
            assert.ok(false)
        })
    })
})
