import * as assert from "assert"
import { checkDuplicate, getTabName } from "./../../src/UI/components/Tabs"

describe("Tab bar utility function tests", () => {
    describe("Array duplicates check", () => {
        it("Should return a true if there is a duplicate in an array", () => {
            const testArray = ["/folder/index.js", "/folderTwo/index.js"]
            const isDuplicate = checkDuplicate("index.js", testArray)
            assert.ok(isDuplicate)
        })
        it("Should return a false if there is not a duplicate in an array", () => {
            const testArray = ["/folder/index.js", "/folderTwo/apple.js"]
            const isDuplicate = checkDuplicate("index.js", testArray)
            assert.ok(!isDuplicate)
        })
    })
    describe("Get tab name function should return a longer name if duplicates present", () => {
        it("Should return a only a filename if there are no duplicates", () => {
            const testArray = ["/folder/index.js", "/folderTwo/apple.js"]
            const isDuplicate = checkDuplicate("index.js", testArray)
            const name = getTabName("index.js", isDuplicate)
            assert.ok(name === "index.js")
        })
        it("Should return a folder and a filename if there are duplicates", () => {
            const testArray = ["/folder/index.js", "/folderTwo/index.js"]
            const isDuplicate = checkDuplicate("index.js", testArray)
            const name = getTabName("/folder/index.js", isDuplicate)
            assert.ok(name === "folder/index.js")
        })
    })
})
