import { mount, shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"
import * as React from "react"

import * as os from "os"

import { HighlightTextByIndex } from "./../browser/src/UI/components/HighlightText"

const initialState = {
    highlightComponent: "em",
    highlightIndices: [0, 1, 3, 4],
    text: "highlight text",
    className: "test-class",
}

describe("<HighlightTextByIndex />", () => {
    it("renders a shallow instance of the component", () => {
        const component = shallow(<HighlightTextByIndex {...initialState} />)

        expect(component.length).toEqual(1)
    })

    it("renders the correct text with highlights", () => {
        const component = mount(<HighlightTextByIndex {...initialState} />)

        // Check the correct text is there
        expect(component.text()).toContain("highlight text")

        // Check the structure is correct
        expect(component.text()).toHaveLength(14)

        // Check only 4 chars were highlighed
        expect(component.find("em")).toHaveLength(4)
    })

    it("renders the correct text with no highlights", () => {
        const testState = {
            highlightComponent: "em",
            highlightIndices: [],
            text: "no highlight text",
            className: "test-class",
        }

        const component = mount(<HighlightTextByIndex {...testState} />)

        // Check the correct text is there
        expect(component.text()).toContain("no highlight text")

        // Check the structure is correct
        expect(component.text()).toHaveLength(17)

        // Check no chars were highlighted
        expect(component.find("em")).toHaveLength(0)
    })

    it("doesn't crash when passed a non-string", () => {
        const testState = {
            highlightComponent: "em",
            highlightIndices: [0, 1, 3, 4],
            text: 10101,
            className: "test-class",
        } as any

        const component = mount(<HighlightTextByIndex {...testState} />)

        // Should be length one, as only the out span is returned
        // due to no inner text.
        expect(component.find("span")).toHaveLength(1)
        expect(component.text()).toBe("")
        expect(component.find("em")).toHaveLength(0)
    })
})
