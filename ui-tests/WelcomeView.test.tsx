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
        openFile: "button1",
        openTutor: "button2",
        openDocs: "button3",
        openConfig: "button4",
        openThemes: "button5",
        openWorkspaceFolder: "button6",
        commandPalette: "button7",
        commandline: "button8",
    }

    const executeCommand = jest.fn()
    const inputEvent = new Event<IWelcomeInputEvent>("handleInputTestEvent")
    let handleInputSpy: jest.SpyInstance<WelcomeView["handleInput"]>

    afterEach(() => {
        if (handleInputSpy) {
            handleInputSpy.mockClear()
        }
        instance.setState({ selectedId: "button1", currentIndex: 0 })
    })

    const wrapper = mount<WelcomeViewProps, WelcomeViewState>(
        <WelcomeView
            active
            buttonIds={buttons}
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
        instance.handleInput({ direction: 1, select: false })
        expect(instance.state.selectedId).toBe("button2")
    })

    it("should loop back to button if user navigates upwards at the first button", () => {
        instance.handleInput({ direction: -1, select: false })
        expect(instance.state.currentIndex).toBe(7)
        expect(instance.state.selectedId).toBe("button8")
    })

    it("should loop back to button if user navigates downwards at the last button", () => {
        instance.setState({ currentIndex: 7, selectedId: "button8" })
        instance.handleInput({ direction: 1, select: false })
        expect(instance.state.currentIndex).toBe(0)
        expect(instance.state.selectedId).toBe("button1")
    })
})
