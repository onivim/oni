import { mount, shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"
import * as React from "react"

import {
    QuickInfoDocumentation,
    QuickInfoTitle,
    Title,
} from "./../browser/src/UI/components/QuickInfo"

describe("<QuickInfo />", () => {
    it("renders a shallow instance of the component", () => {
        const wrapper = shallow(<QuickInfoTitle />)
        expect(shallowToJson(wrapper)).toMatchSnapshot()
        expect(wrapper.length).toEqual(1)
    })

    it("renders the correct text", () => {
        const wrapper = mount(<QuickInfoTitle text="test text" />)
        expect(wrapper.text()).toContain("test text")
    })

    it("renders the documentation correctly", () => {
        const test = "line One\nline Two\nline Three"
        const wrapper = shallow(<QuickInfoDocumentation text={test} />)
        expect(wrapper.children()).toHaveLength(3)
    })
})
