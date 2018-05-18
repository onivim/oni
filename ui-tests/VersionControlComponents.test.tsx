import { mount, shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"
import * as React from "react"

import { Branch, BranchNameContainer } from "./../browser/src/UI/components/VersionControl"

describe("<Branch />", () => {
    const diff = {
        insertions: 2,
        deletions: 8,
        files: null,
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
        const icon = wrapper.find("i.fa-plus-circle")
        expect(icon.length).toBe(1)
    })

    it("should render the correct icon for deletions", () => {
        const wrapper = mount(<Branch branch="test-branch" diff={diff} />)
        const icon = wrapper.find("i.fa-minus-circle")
        expect(icon.length).toBe(1)
    })

    it("Should not render an icon if there were no insertions", () => {
        const wrapper = mount(<Branch branch="test-branch" diff={{ ...diff, insertions: 0 }} />)
        const icon = wrapper.find("i.fa-plus-circle")
        expect(icon.length).toBe(0)
    })

    it("Should not render an icon if there were no deletions", () => {
        const wrapper = mount(<Branch branch="test-branch" diff={{ ...diff, deletions: 0 }} />)
        const icon = wrapper.find("i.fa-minus-circle")
        expect(icon.length).toBe(0)
    })
})
