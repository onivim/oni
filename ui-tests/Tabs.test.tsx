import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"
import * as React from "react"

import { Tab, Tabs } from "../browser/src/UI/components/Tabs"

describe("<Tabs /> Tests", () => {
    const tab = {
        id: 2,
        name: "test",
        description: "a test tab",
        isSelected: true,
        isDirty: true,
        iconFileName: "icon",
        highlightColor: "#000",
    }

    const TabsContainingSingleTab = (
        <Tabs
            fontSize="1.2em"
            maxWidth="20em"
            height="2em"
            fontFamily="inherit"
            backgroundColor="#fff"
            foregroundColor="#000"
            shouldWrap={false}
            visible={true}
            tabs={[tab]}
        />
    )

    const TabsContainingTwoTabs = (
        <Tabs
            fontSize="1.2em"
            maxWidth="20em"
            height="2em"
            fontFamily="inherit"
            backgroundColor="#fff"
            foregroundColor="#000"
            shouldWrap={false}
            visible={true}
            tabs={[tab, tab]}
        />
    )

    const TabsNotVisible = (
        <Tabs
            fontSize="1.2em"
            maxWidth="20em"
            height="2em"
            fontFamily="inherit"
            backgroundColor="#fff"
            foregroundColor="#000"
            shouldWrap={false}
            visible={false}
            tabs={[tab]}
        />
    )

    it("renders without crashing", () => {
        const wrapper = shallow(TabsContainingSingleTab)
        expect(wrapper.length).toEqual(1)
    })

    it("should match last known snapshot unless we make a change", () => {
        const wrapper = shallow(TabsContainingSingleTab)
        expect(shallowToJson(wrapper)).toMatchSnapshot()
    })

    it("Should render the correct number of tabs", () => {
        expect(shallow(TabsContainingSingleTab).children().length).toEqual(1)
        expect(shallow(TabsContainingTwoTabs).children().length).toEqual(2)
    })

    it("Should not render if the visible prop is false", () => {
        const wrapper = shallow(TabsNotVisible)
        expect(wrapper.getElement()).toBe(null)
    })
})
