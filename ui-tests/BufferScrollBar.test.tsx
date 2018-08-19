import { shallow } from "enzyme"
import toJson from "enzyme-to-json"
import * as React from "react"

import { BufferScrollBar } from "./../browser/src/UI/components/BufferScrollBar"

describe("<BufferScrollBar />", () => {
    const markers = [
        {
            line: 4,
            height: 1,
            color: "yellow",
        },
        {
            line: 10,
            height: 1,
            color: "red",
        },
    ]
    it("should render without crashing", () => {
        const wrapper = shallow(
            <BufferScrollBar
                visible
                windowId={1}
                bufferSize={30}
                height={30}
                windowTopLine={1}
                windowBottomLine={25}
                markers={markers}
            />,
        )
        expect(wrapper.length).toBe(1)
    })

    it("should render the correct number of marker elements", () => {
        const wrapper = shallow(
            <BufferScrollBar
                visible
                windowId={1}
                bufferSize={30}
                height={30}
                windowTopLine={1}
                windowBottomLine={25}
                markers={markers}
            />,
        )
        expect(wrapper.dive().find("#scrollbar-marker-element").length).toBe(2)
    })

    it("should render only one marker if two marker elements share line", () => {
        const dupMarkers = [
            ...markers,
            {
                line: 10,
                height: 1,
                color: "yellow",
            },
        ]
        const wrapper = shallow(
            <BufferScrollBar
                visible
                windowId={1}
                bufferSize={30}
                height={30}
                windowTopLine={1}
                windowBottomLine={25}
                markers={dupMarkers}
            />,
        )
        expect(wrapper.dive().find("#scrollbar-marker-element").length).toBe(2)
    })

    it("should match last recorded snapshot", () => {
        const wrapper = shallow(
            <BufferScrollBar
                visible
                windowId={1}
                bufferSize={30}
                height={30}
                windowTopLine={1}
                windowBottomLine={25}
                markers={markers}
            />,
        )

        expect(toJson(wrapper)).toMatchSnapshot()
    })
})
