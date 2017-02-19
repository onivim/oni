import * as assert from "assert"

import { debounce } from "./../../../src/Plugins/Api/PromiseDebouncer"

describe("PromiseDebouncer", () => {
    it("returns original arguments", () => {
        const debouncedFunction = debounce((val: string) => Promise.resolve(val))

        return debouncedFunction("b")
            .then((val) => {
                assert.strictEqual(val, "b")
            })
    })

    it("returns multiple arguments", () => {
        const debouncedFunction = debounce((val1: string, val2: string) => Promise.resolve([val1, val2]))

        return debouncedFunction("a", "b")
            .then((values: string[]) => {
                assert.deepEqual(values, ["a", "b"])
            })
    })

    it("debounces multiple calls", () => {
        let executionCount = 0
        const debouncedFunction = debounce((val: number) => {
            executionCount++
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(val)
                }, 1)
            })
        })

        // The first function should always be executed
        const promise1 = debouncedFunction(100)
            .then((val) => {
                assert.strictEqual(val, 100)
                return val
            })

        // This function will be skipped, because the current function is in progress
        const promise2 = debouncedFunction(200)

        // The last function should always be executed
        const promise3 = debouncedFunction(300)
            .then((val) => {
                assert.strictEqual(val, 300)
                return val
            })

        const successPromises = Promise.all([promise1, promise3])
            .then(() => {
                assert.strictEqual(executionCount, 2)
                return 1
            })

        const allPromises = Promise.all([successPromises, promise2])
            .then(() => assert.ok(false, "Promise2 should not be successful"),
            (_err) => assert.ok(true, "Error path hit as expected"))

        return allPromises
    })
})
