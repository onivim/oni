import { shallow } from "enzyme"
import * as React from "react"
import Help, { Description } from "./../../browser/src/UI/components/VersionControl/Help"

describe("<Help />", () => {
    it("Should render without crashing", () => {
        const wrapper = shallow(<Help />)
        expect(wrapper.length).toBe(1)
    })
    it("Should show correct number of commands", () => {
        const wrapper = shallow(<Help />)
        expect(wrapper.find(Description).length).toBeGreaterThan(5)
    })
    it("Should show correct first command", () => {
        const wrapper = shallow(<Help />)
        const commandText = wrapper
            .find(Description)
            .at(0)
            .dive()
            .text()
        expect(commandText).toMatch(/Open the currently selected file/)
    })
})
