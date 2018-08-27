import * as React from "react"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"

import VersionControlTitle, { Title } from "./../../browser/src/UI/components/SectionTitle"

describe("<VersionControlTitle />", () => {
    it("correctly renders without crashing", () => {
        const wrapper = shallow(
            <VersionControlTitle
                active
                isSelected
                title="test"
                onClick={() => ({})}
                testId="test"
            />,
        )

        expect(wrapper.length).toBe(1)
    })

    it("should render the correct title", () => {
        const wrapper = shallow(
            <VersionControlTitle
                active
                isSelected
                title="test"
                onClick={() => ({})}
                testId="test"
            />,
        )
            .dive()
            .find(Title)
            .dive()
        expect(wrapper.text()).toBe("TEST")
    })

    it("Should correctly show the count if present", () => {
        const wrapper = shallow(
            <VersionControlTitle
                active
                isSelected
                title="test"
                onClick={() => ({})}
                count={5}
                testId="test"
            />,
        )

        expect(
            wrapper
                .dive()
                .find("strong")
                .text(),
        ).toBe("5")
    })

    it("should match last known snapshot", () => {
        const wrapper = shallow(
            <VersionControlTitle
                active
                isSelected
                title="test"
                onClick={() => ({})}
                testId="test"
            />,
        )
        expect(shallowToJson(wrapper)).toMatchSnapshot()
    })
})
