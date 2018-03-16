import { mount, shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"
import * as React from "react"

import { QuickInfoTitle } from "./../browser/src/UI/components/QuickInfo"

describe("<QuickInfo />", () => {
    it("renders a shallow instance of the unconnected component", () => {
        const wrapper = shallow(<QuickInfoTitle />)
        expect(wrapper.length).toEqual(1)
    })
})
