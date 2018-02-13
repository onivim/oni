import { mount, shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"
import * as React from "react"
import { Provider } from "react-redux"
import configureStore, { MockStore, MockStoreCreator } from "redux-mock-store"
import ConnectCommand, { CommandLine } from "../CommandLine"

const mockStore: MockStoreCreator<IState> = configureStore()

interface IState {
    showIcons: boolean
    visible: boolean
    content: string
    firstchar: string
    position: number
    level: number
    prompt: string
}

const initialState = {
    commandLine: {
        showIcons: true,
        visible: true,
        content: "commandline test",
        firstchar: ":",
        position: 0,
        level: 0,
        prompt: "",
    },
    configuration: {
        "experimental.commandline.icons": true,
    },
}

jest.mock("react-dom")

describe("<Commandline />", () => {
    let store: MockStore<IState>
    let container: any

    const CommandLineComponent = <CommandLine {...initialState.commandLine} />

    beforeEach(() => {
        store = mockStore(initialState)
        container = mount(
            <Provider store={store}>
                <ConnectCommand />
            </Provider>,
        )
    })

    it("renders a shallow instance of the unconnected component", () => {
        const wrapper = shallow(CommandLineComponent)
        expect(wrapper.length).toEqual(1)
    })

    it("should match last known snapshot unless we make a change", () => {
        const wrapper = shallow(CommandLineComponent)
        expect(shallowToJson(wrapper)).toMatchSnapshot()
    })

    it("should initially not have a focused state when rendered", () => {
        const wrapper = shallow(CommandLineComponent)
        expect(wrapper.state().focused).toBe(false)
    })

    // REDUX CONNECTED COMPONENT TEST - full mount

    it("renders the connected(Smart) component to ensure this components mounts", () => {
        expect(container.find(ConnectCommand).length).toEqual(1)
    })
})
