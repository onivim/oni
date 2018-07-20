jest.mock("../browser/src/Services/WindowManager")
jest.mock("../browser/src/Services/WindowManager/WindowManager")
jest.mock("../browser/src/Services/Explorer/ExplorerView")
jest.mock("../browser/src/Services/Explorer/ExplorerStore")

import * as React from "react"
import { shallow } from "enzyme"

import { Configuration } from "../browser/src/Services/Configuration"
import MockCommands from "./mocks/CommandManager"
import { configuration } from "./mocks/Configuration"
import MockEditorManager from "./mocks/EditorManager"
import MockWorkspace from "./mocks/Workspace"

import { createStore } from "../browser/src/Services/Explorer/ExplorerStore"
import { ExplorerSplit } from "../browser/src/Services/Explorer/ExplorerSplit"

describe("ExplorerSplit", () => {
    let explorerSplit: ExplorerSplit
    let store: Store<any>

    beforeEach(() => {
        store = {
            dispatch: jest.fn(),
            getState: jest.fn(),
            subscribe: jest.fn(),
            replaceReducer: jest.fn(),
        } as Store<any>
        ;(createStore as jest.Mock).mockReturnValue(store)

        explorerSplit = new ExplorerSplit(
            configuration as Configuration,
            new MockWorkspace(),
            new MockCommands(),
            new MockEditorManager(),
        )
    })

    describe("locateFile", () => {
        it("dispatches SELECT_FILE when called", () => {
            explorerSplit.locateFile("/path/to/file.cpp")

            expect(store.dispatch).toHaveBeenCalledTimes(1)
            expect(store.dispatch).toHaveBeenCalledWith({
                type: "SELECT_FILE",
                filePath: "/path/to/file.cpp",
            })
        })
    })

    describe("_onSelectionChanged", () => {
        let _getSelectedItem: jest.Mock

        beforeEach(() => {
            _getSelectedItem = explorerSplit["_getSelectedItem"] = jest.fn()
        })

        it("dispatches SELECT_FILE_SUCCESS if fileToSelect matches selected item", () => {
            store.getState.mockReturnValue({ fileToSelect: "/path/to/file.cpp" })
            _getSelectedItem.mockReturnValue({
                type: "file",
                filePath: "/path/to/file.cpp",
            })

            explorerSplit["_onSelectionChanged"]("a")

            expect(store.dispatch).not.toHaveBeenCalled()
        })

        it("does not dispatch SELECT_FILE_SUCCESS if fileToSelect isn't selected", () => {
            store.getState.mockReturnValue({ fileToSelect: "/path/to/file.cpp" })
            _getSelectedItem.mockReturnValue({
                type: "file",
                filePath: "/something/else.cpp",
            })

            explorerSplit["_onSelectionChanged"]("a")

            expect(store.dispatch).not.toHaveBeenCalled()
        })

        it("does not dispatch SELECT_FILE_SUCCESS if there is no fileToSelect", () => {
            store.getState.mockReturnValue({ fileToSelect: null })

            explorerSplit["_onSelectionChanged"]("a")

            expect(store.dispatch).not.toHaveBeenCalled()
        })
    })
})
