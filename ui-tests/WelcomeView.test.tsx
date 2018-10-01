import { shallow } from "enzyme"
import toJson from "enzyme-to-json"
import { Event } from "oni-types"
import * as React from "react"

import {
    WelcomeView,
    WelcomeViewProps,
    WelcomeViewState,
    IWelcomeInputEvent,
    SessionsList,
    SectionItem,
    SectionHeader,
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

    const restoreSession = jest.fn()
    const executeCommand = jest.fn()

    const commands = {
        openFile: {
            execute: jest.fn(),
            command: "button1",
        },
        openTutor: {
            execute: jest.fn(),
            command: "button2",
        },
        openDocs: {
            execute: jest.fn(),
            command: "button3",
        },
        openConfig: {
            execute: jest.fn(),
            command: "button4",
        },
        openThemes: {
            execute: jest.fn(),
            command: "button5",
        },
        openWorkspaceFolder: {
            execute: jest.fn(),
            command: "button6",
        },
        quickOpenShow: {
            execute: jest.fn(),
            command: "button7",
        },
        commandline: {
            execute: jest.fn(),
            command: "button8",
        },
        restoreSession,
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

    const inputEvent = new Event<IWelcomeInputEvent>("handleInputTestEvent")
    const getMetadata = async () => ({ version: "1" })

    const ids = [...buttons, ...sessions.map(({ id }) => id)]
    const wrapper = shallow<WelcomeViewProps, WelcomeViewState>(
        <WelcomeView
            active
            ids={ids}
            sessions={sessions}
            commands={commands}
            inputEvent={inputEvent}
            getMetadata={getMetadata}
            restoreSession={restoreSession}
            sections={[buttons.length, sessions.length]}
            executeCommand={executeCommand}
        />,
    )

    it("Should render without crashing", () => {
        expect(wrapper.length).toBe(1)
    })

    it("should match its last snapshot", () => {
        expect(toJson(wrapper)).toMatchSnapshot()
    })

    it("should set the correct version", () => {
        expect(wrapper.state().version).toBe("1")
    })

    it("should have the correct initial state", () => {
        expect(wrapper.state()).toEqual({ version: "1", currentIndex: 0, selectedId: "button1" })
    })

    it("should correctly update selection based on input", () => {
        const instance = wrapper.instance() as WelcomeView
        instance.handleInput({ vertical: 1, select: false })
        expect(wrapper.state().selectedId).toBe("button2")
    })

    it("should loop back to last button if user navigates upwards at the first button", () => {
        wrapper.setState({ currentIndex: 0, selectedId: "button1" })
        const instance = wrapper.instance() as WelcomeView
        instance.handleInput({ vertical: -1, select: false })
        expect(wrapper.state().currentIndex).toBe(ids.length - 1)
        expect(wrapper.state().selectedId).toBe("test-1")
    })

    it("should loop back to first button if user navigates downwards at the last button", () => {
        wrapper.setState({ currentIndex: ids.length - 1, selectedId: "test-1" })
        const instance = wrapper.instance() as WelcomeView
        instance.handleInput({ vertical: 1, select: false })
        expect(wrapper.state().currentIndex).toBe(0)
        expect(wrapper.state().selectedId).toBe("button1")
    })

    it("should trigger a command on enter event", () => {
        const instance = wrapper.instance() as WelcomeView
        instance.handleInput({ vertical: 0, select: true })
        expect(commands.openFile.execute).toHaveBeenCalled()
    })

    it("should navigate right if horizontal is 1", () => {
        wrapper.setState({ currentIndex: 7, selectedId: "button8" })
        const instance = wrapper.instance() as WelcomeView
        instance.handleInput({ vertical: 0, horizontal: 1, select: false })
        expect(wrapper.state().currentIndex).toBe(8)
        expect(wrapper.state().selectedId).toBe("test-1")
    })

    it("should navigate left if horizontal is -1", () => {
        wrapper.setState({ currentIndex: ids.length - 1, selectedId: "test-1" })
        const instance = wrapper.instance() as WelcomeView
        instance.handleInput({ vertical: 0, horizontal: -1, select: false })
        expect(wrapper.state().currentIndex).toBe(0)
        expect(wrapper.state().selectedId).toBe("button1")
    })

    it("should call restore session if the selectedId is a session", () => {
        wrapper.setState({ currentIndex: ids.length - 1, selectedId: "test-1" })
        const instance = wrapper.instance() as WelcomeView
        instance.handleInput({ vertical: 0, horizontal: 0, select: true })
        expect(restoreSession.mock.calls[0][0]).toBe("test")
    })

    it("Should render a section header", () => {
        const headers = wrapper.dive().find(SectionHeader).length
        expect(headers).toBe(1)
    })

    it("should render the place holder text if there are no sessions available", () => {
        wrapper.setProps({ sessions: [] })
        const placeholder = wrapper
            .find(SectionItem)
            .dive()
            .text()
        expect(placeholder).toBe("No Sessions Available")
    })
})
