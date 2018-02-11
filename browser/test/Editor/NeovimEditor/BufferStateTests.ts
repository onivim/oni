import * as assert from "assert"

import * as Mocks from "./../../Mocks"

import { checkTabBuffers } from "./../../../src/UI/components/Tabs"

describe("BufferStateTests", () => {
    describe("tabState", () => {
        let mockEditor: Mocks.MockEditor
        let mockBuffer1: Mocks.MockBuffer
        let mockBuffer2: Mocks.MockBuffer
        let mockBuffer3: Mocks.MockBuffer

        beforeEach(() => {
            mockEditor = new Mocks.MockEditor()
            mockBuffer1 = new Mocks.MockBuffer("typescript", "test.ts", [""])
            mockBuffer2 = new Mocks.MockBuffer("typescript", "test2.ts", [""], 2)
            mockBuffer3 = new Mocks.MockBuffer("typescript", "test3.ts", [""], 3)

            mockEditor.simulateBufferEnter(mockBuffer1)
            mockBuffer1.setLinesSync(["Buffer 1 has been altered."])
        })

        it("Modified buffer is correctly linked to tab", () => {
            const buffers = [mockBuffer1, mockBuffer2, mockBuffer3] as any
            const buffersInTabs = [1, 2]

            const result = checkTabBuffers(buffersInTabs, buffers)

            assert(result, "Modified buffer correctly linked")
        })

        it("Unmodified buffer is correctly linked to tab", () => {
            const buffers = [mockBuffer1, mockBuffer2, mockBuffer3] as any
            const buffersInTabs = [3]

            const result = checkTabBuffers(buffersInTabs, buffers)

            assert(!result, "Unmodified buffer correctly linked")
        })
    })
})
