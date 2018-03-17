import { mount, shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"
import * as React from "react"

import * as os from "os"

import { HighlightTextByIndex } from "./../browser/src/UI/components/HighlightText"

interface IHighlightTextByIndexProps {
    highlightClassName: string
    highlightIndices: number[]
    text: string
    className: string
}

const initialState = {
    highlightClassName: "highlight-test",
    highlightIndices: [0, 1, 3, 4],
    text: "highlight text",
    className: "test-class",
}

describe("<HighlightTextByIndex />", () => {
    const HighlightTextIndexComponent = <HighlightTextByIndex {...initialState} />

    it("renders a shallow instance of the component", () => {
        const wrapper = shallow(<HighlightTextByIndex {...initialState} />)
        expect(wrapper.length).toEqual(1)
    })

    it("renders the correct text", () => {
        const wrapper = mount(<HighlightTextByIndex {...initialState} />)
        expect(wrapper.text()).toContain("highlight text")
        expect(wrapper.text()).toHaveLength(14)
        expect(wrapper.find("span")).toHaveLength(15)
    })

    it("renders non-string correcttly", () => {
        const testState = {
            highlightClassName: "highlight-test",
            highlightIndices: [0, 1, 3, 4],
            text: 10101,
            className: "test-class",
        } as any

        const wrapper = shallow(<HighlightTextByIndex {...testState} />)
        expect(wrapper.find("span")).toHaveLength(1)
    })
})
