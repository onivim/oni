import { BufferManager, InactiveBuffer } from "./../browser/src/Editor/BufferManager"

describe("Buffer Manager Tests", () => {
    const neovim = {} as any
    const actions = {} as any
    const store = {
        getState: jest.fn(),
    } as any

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

    beforeEach(() => {
        manager.updateBufferFromEvent(event)
    })

    it("Should correctly set buffer variables", () => {
        const buffer = manager.getBufferById("1")
        expect(buffer.tabstop).toBe(8)
        expect(buffer.shiftwidth).toBe(2)
        expect(buffer.comment.defaults.includes("//")).toBe(true)
        expect(buffer.comment.end.includes("*/")).toBe(true)
    })

    it("Should correctly populate the buffer list", () => {
        manager.populateBufferList({
            current: event,
            existingBuffers: [inactive1],
        })

        const buffers = manager.getBuffers()
        expect(buffers.length).toBe(2)
        expect(buffers.find(buffer => buffer instanceof InactiveBuffer)).toBeTruthy()
    })

    it("Should correctly format a comment string (based on neovim &comment option)", () => {
        const buffer = manager.getBufferById("1")
        const comment = "s1:/*,ex:*/,://,b:#,:%"
        const formatted = buffer.formatCommentOption(comment)
        expect(formatted.start.includes("/*")).toBeTruthy()
        expect(formatted.end.includes("*/")).toBeTruthy()
        expect(formatted.defaults.includes("//")).toBeTruthy()
        expect(formatted.defaults.includes("#")).toBeTruthy()
    })

    it("should correctly pass input to a layer that implements a handler", () => {
        store.getState.mockReturnValue({
            layers: {
                "1": [
                    {
                        handleInput: (key: string) => true,
                        isActive: () => true,
                    },
                ],
            },
        })

        const buffer = manager.getBufferById("1")
        const canHandleInput = buffer.handleInput("h")
        expect(canHandleInput).toBeTruthy()
    })

    it("should not allow handling of input if isActive does not exist on the layer", () => {
        store.getState.mockReturnValue({
            layers: {
                "1": [
                    {
                        handleInput: (key: string) => true,
                    },
                ],
            },
        })

        const buffer = manager.getBufferById("1")
        const canHandleInput = buffer.handleInput("h")
        expect(canHandleInput).toBeFalsy()
    })

    it("should not intercept input for a layer that implements a handler but returns isActive = false", () => {
        store.getState.mockReturnValue({
            layers: {
                "1": [
                    {
                        handleInput: (key: string) => true,
                        isActive: () => false,
                    },
                ],
            },
        })
        const buffer = manager.getBufferById("1")
        const canHandleInput = buffer.handleInput("h")
        expect(canHandleInput).toBeFalsy()
    })
})
