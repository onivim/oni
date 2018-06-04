import * as React from "react"
import { shallow } from "enzyme"

import { SelectedText, Text } from "./../browser/src/UI/components/Text"

describe("<Text/SelectedText />", () => {
    it("Text component should match the last snapshot on record", () => {
        const wrapper = shallow(<Text text="Test" />)
        expect(wrapper).toMatchSnapshot()
    })
    it("SelectedText component should match the last snapshot on record", () => {
        const wrapper = shallow(<SelectedText text="Test" />)
        expect(wrapper).toMatchSnapshot()
    })
})
