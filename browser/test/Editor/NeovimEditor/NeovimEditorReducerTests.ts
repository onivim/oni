import * as assert from "assert"

import * as Oni from "oni-api"

import * as Actions from "./../../../src/Editor/NeovimEditor/NeovimEditorActions"
import {
    layersReducer,
    windowStateReducer,
} from "./../../../src/Editor/NeovimEditor/NeovimEditorReducer"
import * as State from "./../../../src/Editor/NeovimEditor/NeovimEditorStore"

describe("NeovimEditorReducer", () => {
    describe("layersReducer", () => {
        it("Adds layer via 'ADD_BUFFER_LAYER'", () => {
            const simpleLayer: Oni.EditorLayer = {
                id: "test",
                friendlyName: "Test",
                render(): JSX.Element {
                    return null
                },
            }

            const addLayerAction = Actions.addBufferLayer(1, simpleLayer)

            const newState = layersReducer({}, addLayerAction)

            const layers = newState[1]
            assert.deepEqual(layers, [simpleLayer], "Verify layer was added")
        })
    })

    describe("windowStateReducer", () => {
        it("Sets inactive window state via 'SET_INACTIVE_WINDOW_STATE'", () => {
            const windowState: State.IWindowState = {
                activeWindow: -1,
                windows: {},
            }

            const windowRect = { x: 1, y: 1, width: 5, height: 5 }
            const action = Actions.setInactiveWindowState(1, windowRect)

            const newState = windowStateReducer(windowState, action)

            assert.deepEqual(newState.windows[1].dimensions, windowRect)
        })
    })
})
