import { shallow } from "enzyme"
import * as React from "react"

import { DefaultLogFields } from "../../browser/src/Services/VersionControl/VersionControlProvider"
import VCSCommits, { ListItem } from "./../../browser/src/UI/components/VersionControl/Commits"

describe("<VCSCommits />", () => {
    const fakeCommits: DefaultLogFields[] = [
        {
            date: null,
            message: "test 2",
            author_email: "test@test.com",
            author_name: "test",
            hash: "FG45755",
        },
        {
            message: "test",
            date: null,
            author_name: "john",
            author_email: "john@test.com",
            hash: "FG11111",
        },
    ]
    it("it renders without crashing", () => {
        const wrapper = shallow(
            <VCSCommits
                visibility
                onClick={() => null}
                toggleVisibility={() => null}
                commits={fakeCommits}
                selectedId="FG11111"
                titleId="Recent Commits"
            />,
        )
        expect(wrapper.length).toBe(1)
    })

    it("Should render the correct number of items for commits", () => {
        const wrapper = shallow(
            <VCSCommits
                visibility
                onClick={() => null}
                toggleVisibility={() => null}
                commits={fakeCommits}
                selectedId="FG11111"
                titleId="Recent Commits"
            />,
        )
        expect(wrapper.find(ListItem).length).toBe(2)
    })

    it("Should render no commits if visibility is false", () => {
        const wrapper = shallow(
            <VCSCommits
                visibility={false}
                onClick={() => null}
                toggleVisibility={() => null}
                commits={fakeCommits}
                selectedId="FG11111"
                titleId="Recent Commits"
            />,
        )
        expect(wrapper.find(ListItem).length).toBe(0)
    })

    it("Should not render items if there are no commits", () => {
        const wrapper = shallow(
            <VCSCommits
                visibility={false}
                onClick={() => null}
                toggleVisibility={() => null}
                commits={[]}
                selectedId="FG11111"
                titleId="Recent Commits"
            />,
        )
        expect(wrapper.find(ListItem).length).toBe(0)
    })
})
