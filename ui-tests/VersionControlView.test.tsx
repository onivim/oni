import { mount, shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"
import * as React from "react"
import { Provider } from "react-redux"
import configureStore, { MockStore, MockStoreCreator } from "redux-mock-store"

const mockStore: MockStoreCreator<IState> = configureStore()

import { DefaultState, IState } from "./../browser/src/Services/VersionControl/VersionControlStore"
import VersionControlView, {
    GitStatus,
    SectionTitle,
} from "./../browser/src/Services/VersionControl/VersionControlView"

describe("<VersionControlView />", () => {
    const store = mockStore(DefaultState)
    const container = mount(
        <Provider store={store}>
            <VersionControlView getStatus={() => ({})} />
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
            <GitStatus title="modified files" selectedId="file1" symbol="M" files={null} />,
        )
        expect(wrapper.find(SectionTitle).length).toBe(0)
    })

    it("should match the last recorded snapshot unless a change was made", () => {
        const wrapper = shallow(
            <GitStatus
                title="modified files"
                selectedId="file1"
                symbol="M"
                files={["test1", "test2"]}
            />,
        )
        expect(shallowToJson(wrapper)).toMatchSnapshot()
    })

    it("should render the correct number of modified files from the store in the correct section from of the pane", () => {
        const stateCopy = {
            ...DefaultState,
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
                <VersionControlView getStatus={() => ({})} />
            </Provider>,
        )

        const modified = containerWithMods.find("[data-test='Modified Files-2'] > strong")
        expect(modified.text()).toBe("2")
    })
})
