import { mount, shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"
import * as React from "react"

import Octicon from "./../../browser/src/UI/components/Octicon"

import {
    Branch,
    BranchNameContainer,
} from "./../../browser/src/UI/components/VersionControl/Branch"

describe("<Branch />", () => {
    const diff = {
        insertions: 2,
        deletions: 8,
        files: null as any,
    }

    it("Should render without crashing", () => {
        const wrapper = shallow(<Branch branch="test-branch" diff={diff} />)
        expect(wrapper.length).toEqual(1)
    })

    it("Should render the correct branch name", () => {
        const wrapper = shallow(<Branch branch="test-branch" diff={diff} />)
        const name = wrapper
            .find(BranchNameContainer)
            .dive()
            .text()
        expect(name).toBe("test-branch < />")
    })
    it("should match last known snapshot unless we make a change", () => {
        const wrapper = shallow(<Branch branch="test-branch" diff={diff} />)
        expect(shallowToJson(wrapper)).toMatchSnapshot()
    })

    it("Should show the correct number of additions", () => {
        const wrapper = mount(<Branch branch="test-branch" diff={diff} />)
        const additions = wrapper.find("[data-test='addition-2']")
        expect(additions.find("span").text()).toEqual("2")
    })

    it("Should show the correct number of deletions", () => {
        const wrapper = mount(<Branch branch="test-branch" diff={diff} />)
        const deletions = wrapper.find("[data-test='deletion-8']")
        expect(deletions.find("span").text()).toEqual("8")
    })

    it("should render the correct icon for additions", () => {
        const wrapper = mount(<Branch branch="test-branch" diff={diff} />)
        const hasAdded = wrapper.contains(<Octicon name="diff-added" />)
        expect(hasAdded).toBe(true)
    })

    it("should render the correct icon for deletions", () => {
        const wrapper = mount(<Branch branch="test-branch" diff={diff} />)
        const hasDeleted = wrapper.contains(<Octicon name="diff-removed" />)
        expect(hasDeleted).toBe(true)
    })

    it("Should not render an icon if there were no insertions", () => {
        const wrapper = mount(<Branch branch="test-branch" diff={{ ...diff, insertions: 0 }} />)
        const icon = wrapper.contains(<Octicon name="diff-added" />)
        expect(icon).toBe(false)
    })

    it("Should not render an icon if there were no deletions", () => {
        const wrapper = mount(<Branch branch="test-branch" diff={{ ...diff, deletions: 0 }} />)
        const icon = wrapper.contains(<Octicon name="diff-removed" />)
        expect(icon).toBe(false)
    })
})
