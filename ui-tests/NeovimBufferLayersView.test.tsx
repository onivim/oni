import { shallow } from "enzyme"
import * as React from "react"

import { IBufferLayer } from "./../browser/src/Editor/NeovimEditor/BufferLayerManager"
import { NeovimBufferLayersView } from "./../browser/src/Editor/NeovimEditor/NeovimBufferLayersView"
import { IWindow } from "./../browser/src/Editor/NeovimEditor/NeovimEditorStore"

describe("<NeovimBufferLayersView/>", () => {
    const mockLayer: IBufferLayer = {
        id: "test layer",
        render: jest.fn().mockReturnValue(<div id="test-layer">layer</div>),
    }
    const layers = { 2: [mockLayer] }
    const windows: IWindow[] = [
        {
            file: "test.txt",
            bufferId: 2,
            windowId: 1,
            column: 4,
            line: 2,

            bufferToScreen: jest.fn(),
            screenToPixel: jest.fn().mockReturnValue({
                screenX: 20,
                screenY: 30,
            }),
            bufferToPixel: jest.fn(),

            dimensions: { x: 0, y: 0, width: 100, height: 40 },
            topBufferLine: 20,
            bottomBufferLine: 40,

            visibleLines: ["test string", "test string", "test string"],
        },
    ]
    it("Should render without crashing", () => {
        const wrapper = shallow(
            <NeovimBufferLayersView
                fontPixelHeight={10}
                fontPixelWidth={3}
                layers={layers}
                activeWindowId={1}
                windows={windows}
            />,
        )

        expect(wrapper.length).toBe(1)
    })

    it("should render the layers contents", () => {
        const wrapper = shallow(
            <NeovimBufferLayersView
                fontPixelHeight={10}
                fontPixelWidth={3}
                layers={layers}
                activeWindowId={1}
                windows={windows}
            />,
        )

        expect(wrapper.find("#test-layer").length).toBe(1)
    })
    it("should call the layers render function with the correct args", () => {
        shallow(
            <NeovimBufferLayersView
                fontPixelHeight={10}
                fontPixelWidth={3}
                layers={layers}
                activeWindowId={1}
                windows={windows}
            />,
        )

        const context = (mockLayer.render as any).mock.calls[0][0]
        expect(context).toEqual({
            isActive: true,
            windowId: 1,
            fontPixelWidth: 3,
            fontPixelHeight: 10,
            cursorColumn: 4,
            cursorLine: 2,
            bufferToScreen: windows[0].bufferToScreen,
            screenToPixel: windows[0].screenToPixel,
            bufferToPixel: windows[0].bufferToPixel,
            dimensions: windows[0].dimensions,
            visibleLines: ["test string", "test string", "test string"],
            topBufferLine: 20,
            bottomBufferLine: 40,
        })
    })
})
