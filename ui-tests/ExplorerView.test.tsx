import { shallow } from "enzyme"
import * as _ from "lodash"
import * as React from "react"
import { createStore, Reducer, Store } from "redux"
import configureMockStore, { MockStoreCreator, MockStore } from "redux-mock-store"

import { Explorer } from "../browser/src/Services/Explorer/ExplorerView"
jest.mock("../browser/src/Services/Explorer/ExplorerSelectors")
import * as ExplorerSelectors from "../browser/src/Services/Explorer/ExplorerSelectors"
import * as ExplorerState from "../browser/src/Services/Explorer/ExplorerStore"

describe("<ExplorerView />", () => {
    let wrapper: any
    let store: any

    beforeEach(() => {
        // Store that simply merges any action with the state.
        store = createStore(
            (state, action: any) => {
                return { ...state, ...action.state }
            },
            { ...ExplorerState.DefaultExplorerState },
        )
        wrapper = shallow(
            <Explorer
                moveFileOrFolder={jest.fn()}
                onSelectionChanged={jest.fn()}
                onClick={jest.fn()}
                onCancelRename={jest.fn()}
                onCompleteRename={jest.fn()}
            />,
            { context: { store } },
        )
    })

    it("sets idToSelect prop from fileToSelect state", () => {
        const mock = ExplorerSelectors.mapStateToNodeList as jest.Mock
        mock.mockImplementation(
            () =>
                [
                    {
                        id: "a",
                        type: "file",
                        filePath: "/root/workspace/dir1/dir2/file1.cpp",
                        modified: false,
                        name: "a name",
                        indentationLevel: 3,
                    },
                    {
                        id: "b",
                        type: "file",
                        filePath: "/root/workspace/dir1/dir3/file2.cpp",
                        modified: false,
                        name: "a name",
                        indentationLevel: 3,
                    },
                ] as ExplorerSelectors.ExplorerNode[],
        )

        store.dispatch({
            type: "mock",
            state: { fileToSelect: "/root/workspace/dir1/dir3/file2.cpp" },
        })
        wrapper.update()
        expect(wrapper.props().idToSelect).toEqual("b")
    })
})
