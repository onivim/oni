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
        visibleLines: [
            // Absolute line numbers
            "test string1", // line 20
            "test string2",
            "",
            "test string4",
            "test string5",
            "test string6",
            "test string7",
            "test string8",
            "test string9",
            "test string10",
            "test string11",
            "cursor", // line 22
            "test string13",
            "test string14",
            "test string15",
            "test string16",
            "test string17",
            "test string18",
            "test string19",
            "test string20", // line 40
        ],
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
            "quickOpen.show",
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
