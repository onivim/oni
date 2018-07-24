import { shallow } from "enzyme"
import * as React from "react"

import { PrevCommits } from "../../browser/src/Services/VersionControl/VersionControlStore"
import VCSCommits, { ListItem } from "./../../browser/src/UI/components/VersionControl/Commits"

describe("<VCSCommits />", () => {
    const fakeCommits: PrevCommits[] = [
        {
            message: "test 2",
            branch: "local",
            author: null,
            commit: "FG45755",
            summary: {
                changes: 7,
                insertions: 1,
                deletions: 6,
            },
        },
        {
            message: "test",
            branch: "master",
            author: null,
            commit: "FG11111",
            summary: {
                changes: 3,
                insertions: 1,
                deletions: 2,
            },
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
