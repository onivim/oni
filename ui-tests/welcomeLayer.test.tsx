import * as React from "react"
import { Event } from "oni-types"

import {
    IWelcomeInputEvent,
    OniWithActiveSection,
    WelcomeBufferLayer,
} from "./../browser/src/Editor/NeovimEditor/WelcomeBufferLayer"
import MockOni from "./mocks/Oni"

describe("Welcome Layer tests", () => {
    const context = {
        isActive: true,
        windowId: 1,
        fontPixelWidth: 3,
        fontPixelHeight: 10,
        cursorColumn: 4,
        cursorLine: 30,
        bufferToScreen: jest.fn(),
        screenToPixel: jest.fn(),
        bufferToPixel: jest.fn().mockReturnValue({
            pixelX: 20,
            pixelY: 20,
        }),
        dimensions: {
            width: 100,
            height: 100,
            x: 0,
            y: 0,
        },
        visibleLines: [],
        topBufferLine: 20,
        bottomBufferLine: 40,
    }

    const mockEvent = {
        dispatch: jest.fn(),
        subscribe: jest.fn(),
    }

    const mockRestoreSession = jest.fn()
    const getActiveSectionMock = jest.fn()

    let layer: WelcomeBufferLayer

    const setup = () => {
        const oni = new MockOni({
            getActiveSection: jest.fn(),
            sessions: { restoreSession: mockRestoreSession, allSessions: [] },
        })
        getActiveSectionMock.mockReturnValue("editor")
        layer = new WelcomeBufferLayer(oni as OniWithActiveSection)
        layer.inputEvent = mockEvent as any
    }

    beforeEach(() => {
        setup()
    })

    afterEach(() => {
        mockEvent.dispatch.mockClear()
        mockEvent.subscribe.mockClear()
    })

    it("should correctly return a component", () => {
        // this test can return the actual jsx but its difficult to test the exact return value
        expect(layer.render(context)).toBeTruthy()
    })

    it("should correctly dispatch a right navigation event", () => {
        layer.handleInput("l")
        expect(mockEvent.dispatch.mock.calls[0][0]).toEqual({
            horizontal: 1,
            vertical: 0,
            select: false,
        })
    })

    it("should correctly dispatch a upwards navigation event", () => {
        layer.handleInput("k")
        expect(mockEvent.dispatch.mock.calls[0][0]).toEqual({
            vertical: -1,
            select: false,
        })
    })

    it("should correctly dispatch a upwards navigation event", () => {
        layer.handleInput("j")
        expect(mockEvent.dispatch.mock.calls[0][0]).toEqual({
            vertical: 1,
            select: false,
        })
    })

    it("should correctly return an active status of false if the editor is not active", () => {
        getActiveSectionMock.mockReturnValueOnce("commandline")
        expect(layer.isActive()).toBe(false)
    })

    it("should have the correct command names [THIS IS TO PREVENT WELCOME COMMAND REGRESSIONS]", () => {
        const existingCommands = [
            "oni.editor.newFile",
            "workspace.openFolder",
            "commands.show",
            "editor.executeVimCommand",
            "oni.tutor.open",
            "oni.docs.open",
            "oni.config.openUserConfig",
            "oni.themes.open",
        ]
        const props = layer.getProps()
        expect(props.ids).toEqual(existingCommands)
        expect(props.sections).toEqual([8])
    })
})
