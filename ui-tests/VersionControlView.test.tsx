import { mount, shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"
import * as React from "react"
import { Provider } from "react-redux"
import configureStore, { MockStore, MockStoreCreator } from "redux-mock-store"

import {
    DefaultState,
    VersionControlState,
} from "./../browser/src/Services/VersionControl/VersionControlStore"
import VersionControlView, {
    GitStatus,
    SectionTitle,
} from "./../browser/src/Services/VersionControl/VersionControlView"

const mockStore: MockStoreCreator<VersionControlState> = configureStore()

const noop = () => ({})

jest.mock("../browser/src/UI/components/Sneakable", () => {
    const React = require("react") // tslint:disable-line
    return { Sneakable: () => <div /> }
})

describe("<VersionControlView />", () => {
    const store = mockStore({ ...DefaultState, activated: true, hasFocus: true })
    const container = mount(
        <Provider store={store}>
            <VersionControlView getStatus={() => Promise.resolve({})} />
        </Provider>,
    )
    it("renders without crashing", () => {
        expect(container.length).toBe(1)
    })

    it("should render an untracked, staged and modified section", () => {
        const sections = container.find(GitStatus).length
        expect(sections).toBe(3)
    })

    it("shouldn't show a section if it has no content", () => {
        const wrapper = shallow(
            <GitStatus
                onClick={noop}
                toggleVisibility={noop}
                visibility={true}
                titleId="modified"
                selectedId="file1"
                icon="M"
                files={null}
            />,
        )
        expect(wrapper.find(SectionTitle).length).toBe(0)
    })

    it("should match the last recorded snapshot unless a change was made", () => {
        const wrapper = shallow(
            <GitStatus
                titleId="modified"
                visibility={true}
                toggleVisibility={noop}
                onClick={noop}
                selectedId="file1"
                icon="M"
                files={["test1", "test2"]}
            />,
        )
        expect(shallowToJson(wrapper)).toMatchSnapshot()
    })

    it("should render the correct number of modified files from the store in the correct section from of the pane", () => {
        const stateCopy = {
            ...DefaultState,
            activated: true,
            hasFocus: true,
            status: {
                currentBranch: null,
                staged: [],
                conflicted: [],
                created: [],
                modified: ["test1", "test2"],
                remoteTrackingBranch: null,
                deleted: [],
                untracked: [],
                ahead: null,
                behind: null,
            },
        }
        const storeWithMods = mockStore(stateCopy)
        const containerWithMods = mount(
            <Provider store={storeWithMods}>
                <VersionControlView getStatus={() => Promise.resolve({})} />
            </Provider>,
        )

        const modified = containerWithMods.find("[data-test='modified-2'] > strong")
        expect(modified.text()).toBe("2")
    })
})
