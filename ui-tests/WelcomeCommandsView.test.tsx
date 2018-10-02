import { shallow } from "enzyme"
import toJson from "enzyme-to-json"

import * as React from "react"

import {
    WelcomeButton,
    WelcomeCommandsView,
} from "./../browser/src/Editor/NeovimEditor/WelcomeBufferLayer"

describe("Welcome Layer test", () => {
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
        commandPalette: {
            execute: jest.fn(),
            command: "button7",
        },
        commandline: {
            execute: jest.fn(),
            command: "button8",
        },
        restoreSession,
    }

    it("should render without crashing", () => {
        const wrapper = shallow(
            <WelcomeCommandsView
                selectedId="button1"
                active
                commands={commands}
                executeCommand={executeCommand}
            />,
        )
        expect(wrapper.length).toBe(1)
    })

    it("should match last snapshot on record", () => {
        const wrapper = shallow(
            <WelcomeCommandsView
                selectedId="button1"
                active
                commands={commands}
                executeCommand={executeCommand}
            />,
        )
        expect(toJson(wrapper)).toMatchSnapshot()
    })
    it("should have the correct number of buttons for each commands", () => {
        const wrapper = shallow(
            <WelcomeCommandsView
                selectedId="button1"
                active
                commands={commands}
                executeCommand={executeCommand}
            />,
        )
        expect(wrapper.dive().find(WelcomeButton).length).toBe(8)
    })
})
