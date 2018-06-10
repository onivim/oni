import * as React from "react"
import { shallow } from "enzyme"

import { WindowTitleView } from "./../browser/src/UI/components/WindowTitle"

describe("<WindowTitleView />", () => {
    it("Text component should match the last snapshot on record", () => {
        const wrapper = shallow(<WindowTitleView title="Test Window" visible={true} />)
        expect(wrapper).toMatchSnapshot()
    })
    it("should only render if visible", () => {
        const wrapper = shallow(<WindowTitleView title="Test" visible={false} />)
        expect(wrapper.children().length).toBe(0)
    })
})
