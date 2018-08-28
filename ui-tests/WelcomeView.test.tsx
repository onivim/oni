import { mount } from "enzyme"
import { Event } from "oni-types"
import * as React from "react"

import {
    WelcomeView,
    WelcomeViewProps,
    WelcomeViewState,
    IWelcomeInputEvent,
} from "./../browser/src/Editor/NeovimEditor/WelcomeBufferLayer"

describe("<WelcomeView />", () => {
    const buttons = [
        "button1",
        "button2",
        "button3",
        "button4",
        "button5",
        "button6",
        "button7",
        "button8",
    ]

    const commands = {
        openFile: { command: "button1" },
        openTutor: { command: "button2" },
        openDocs: { command: "button3" },
        openConfig: { command: "button4" },
        openThemes: { command: "button5" },
        openWorkspaceFolder: { command: "button6" },
        commandPalette: { command: "button7" },
        commandline: { command: "button8" },
    }

    const sessions = [
        {
            name: "test",
            id: "test-1",
            file: "/test/dir",
            directory: "/test/dir",
            workspace: "/test/dir",
        },
    ]

    const restoreSession = jest.fn()
    const executeCommand = jest.fn()
    const inputEvent = new Event<IWelcomeInputEvent>("handleInputTestEvent")

    afterEach(() => {
        instance.setState({ selectedId: "button1", currentIndex: 0 })
    })

    const ids = [...buttons, ...sessions.map(({ id }) => id)]
    const wrapper = mount<WelcomeViewProps, WelcomeViewState>(
        <WelcomeView
            active
            restoreSession={restoreSession}
            ids={ids}
            sections={[buttons.length, sessions.length]}
            sessions={sessions}
            inputEvent={inputEvent}
            commands={commands}
            executeCommand={executeCommand}
        />,
    )
    const instance = wrapper.instance() as WelcomeView

    it("Should render without crashing", () => {
        expect(wrapper.length).toBe(1)
    })

    it("should default initial state to the first button id", () => {
        expect(instance.state.selectedId).toBe("button1")
    })

    it("should correctly update selection based on input", () => {
        instance.handleInput({ vertical: 1, select: false })
        expect(instance.state.selectedId).toBe("button2")
    })

    it("should loop back to last button if user navigates upwards at the first button", () => {
        instance.handleInput({ vertical: -1, select: false })
        expect(instance.state.currentIndex).toBe(ids.length - 1)
        expect(instance.state.selectedId).toBe("test-1")
    })

    it("should loop back to first button if user navigates downwards at the last button", () => {
        instance.setState({ currentIndex: ids.length - 1, selectedId: "test-1" })
        instance.handleInput({ vertical: 1, select: false })
        expect(instance.state.currentIndex).toBe(0)
        expect(instance.state.selectedId).toBe("button1")
    })

    it("should trigger a command on enter event", () => {
        instance.handleInput({ vertical: 0, select: true })
        expect(executeCommand.mock.calls[0][0]).toBe("button1")
    })

    it("should navigate right if horizontal is 1", () => {
        instance.setState({ currentIndex: 7, selectedId: "button8" })
        instance.handleInput({ vertical: 0, horizontal: 1, select: false })
        expect(instance.state.currentIndex).toBe(8)
        expect(instance.state.selectedId).toBe("test-1")
    })

    it("should navigate left if horizontal is -1", () => {
        instance.setState({ currentIndex: ids.length - 1, selectedId: "test-1" })
        instance.handleInput({ vertical: 0, horizontal: -1, select: false })
        expect(instance.state.currentIndex).toBe(0)
        expect(instance.state.selectedId).toBe("button1")
    })
})
