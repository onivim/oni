import { mount, shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"
import * as React from "react"

import { Tab, Tabs } from "../browser/src/UI/components/Tabs"

jest.mock("classNames")

describe("<Tabs /> Tests", () => {
    const testTabs = [
        {
            id: 2,
            name: "test",
            description: "a test tab",
            isSelected: true,
            isDirty: true,
            iconFileName: "icon",
            highlightColor: "#000",
        },
    ]
    const TestTabs = (
        <Tabs
            fontSize="1.2em"
            maxWidth="20em"
            height="2em"
            fontFamily="inherit"
            backgroundColor="#fff"
            foregroundColor="#000"
            shouldWrap={false}
            visible={true}
            tabs={testTabs}
        />
    )
    it("renders without crashing", () => {
        const wrapper = shallow(TestTabs)
        expect(wrapper.length).toEqual(1)
    })
    it("should match last known snapshot unless we make a change", () => {
        const wrapper = shallow(TestTabs)
        expect(shallowToJson(wrapper)).toMatchSnapshot()
    })
    it("Should show the modified icon if the tab is dirty", () => {
        const wrapper = shallow(TestTabs)
        const circle = wrapper
            .find(Tab)
            .dive()
            .find(".circle")
        expect(circle.length).toEqual(1)
    })
})
