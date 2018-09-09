import { shallow } from "enzyme"
import toJson from "enzyme-to-json"

import * as React from "react"

import {
    WelcomeButton,
    WelcomeCommandsView,
} from "./../browser/src/Editor/NeovimEditor/WelcomeBufferLayer"

describe("Welcome Layer test", () => {
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
    const executeMock = jest.fn()
    it("should render without crashing", () => {
        const wrapper = shallow(
            <WelcomeCommandsView
                selectedId="button1"
                active
                commands={commands}
                executeCommand={executeMock}
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
                executeCommand={executeMock}
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
                executeCommand={executeMock}
            />,
        )
        expect(wrapper.dive().find(WelcomeButton).length).toBe(Object.values(commands).length)
    })
})
