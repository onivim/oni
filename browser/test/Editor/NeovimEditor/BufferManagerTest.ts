import * as assert from "assert"

import { BufferManager, InactiveBuffer } from "./../../../src/Editor/BufferManager"

describe("Buffer Manager Tests", () => {
    const neovim = {} as any
    const actions = {} as any
    const store = {} as any
    const manager = new BufferManager(neovim, actions, store)
    const event = {
        bufferFullPath: "/test/file",
        bufferTotalLines: 2,
        bufferNumber: 1,
        modified: false,
        hidden: false,
        listed: true,
        version: 1,
        line: 0,
        column: 0,
        byte: 8,
        filetype: "js",
        tabNumber: 1,
        windowNumber: 1,
        wincol: 10,
        winline: 25,
        windowTopLine: 0,
        windowBottomLine: 200,
        windowWidth: 100,
        windowHeight: 100,
        tabstop: 8,
        shiftwidth: 2,
        comments: "://,ex:*/",
    }

    const inactive1 = {
        bufferNumber: 2,
        bufferFullPath: "/test/two",
        filetype: "js",
        buftype: "",
        modified: false,
        hidden: false,
        listed: true,
        version: 1,
    }

    it("Should correctly set buffer variables", () => {
        manager.updateBufferFromEvent(event)
        const buffer = manager.getBufferById("1")
        assert(buffer.tabstop === 8, "tabstop is set correctly")
        assert(buffer.shiftwidth === 2, "shiftwidth is set correctly")
        assert(buffer.comment.defaults.includes("//"), "comments are set correctly")
        assert(buffer.comment.end.includes("*/"), "comments are set correctly")
    })

    it("Should correctly populate the buffer list", () => {
        manager.updateBufferFromEvent(event)
        manager.populateBufferList({
            current: event,
            existingBuffers: [inactive1],
        })

        const buffers = manager.getBuffers()
        assert(buffers.length === 2, "Two buffers were added")
        assert(
            buffers.find(buffer => buffer instanceof InactiveBuffer),
            "One of the buffers is an inactive buffer",
        )
    })

    it("Should correctly format a comment string (based on neovim &comment option)", () => {
        manager.updateBufferFromEvent(event)
        const buffer = manager.getBufferById("1")
        const comment = "s1:/*,ex:*/,://,b:#,:%"
        const formatted = buffer.formatCommentOption(comment)
        assert(formatted.start.includes("/*"), "Correctly parses a comment string")
        assert(formatted.end.includes("*/"), "Correctly parses a comment string")
        assert(formatted.defaults.includes("//"), "Correctly parses a comment string")
        assert(formatted.defaults.includes("#"), "Correctly parses a comment string")
    })
})
