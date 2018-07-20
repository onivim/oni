import { shallow, mount } from "enzyme"
import { shallowToJson } from "enzyme-to-json"
import * as React from "react"

import {
    DefaultState,
    VersionControlState,
} from "./../../browser/src/Services/VersionControl/VersionControlStore"
import { VersionControlView } from "./../../browser/src/Services/VersionControl/VersionControlView"
import Commits from "./../../browser/src/UI/components/VersionControl/Commits"
import { SectionTitle } from "./../../browser/src/UI/components/VersionControl/SectionTitle"
import Staged from "./../../browser/src/UI/components/VersionControl/Staged"
import VersionControlStatus from "./../../browser/src/UI/components/VersionControl/Status"

const noop = () => ({})

jest.mock("./../../browser/src/neovim/SharedNeovimInstance", () => ({
    getInstance: () => ({
        bindToMenu: () => ({
            setItems: jest.fn(),
            onCursorMoved: {
                subscribe: jest.fn(),
            },
        }),
    }),
}))

const makePromise = (arg?: any) => Promise.resolve(arg)

jest.mock("../../browser/src/UI/components/Sneakable", () => {
    const React = require("react") // tslint:disable-line
    return { Sneakable: () => <div /> }
})

describe("<VersionControlView />", () => {
    const state = { ...DefaultState, activated: true, hasFocus: true }
    const container = shallow(
        <VersionControlView
            showHelp={false}
            committing={false}
            cancelCommit={noop}
            updateCommitMessage={noop}
            commits={[]}
            message={[]}
            selectedItem={null}
            {...state}
            getStatus={() => makePromise({})}
        />,
    )
    it("renders without crashing", () => {
        expect(container.length).toBe(1)
    })

    it("should render an untracked, staged and modified section", () => {
        const container = mount(
            <VersionControlView
                showHelp={false}
                committing={false}
                cancelCommit={noop}
                updateCommitMessage={noop}
                commits={[]}
                message={[]}
                selectedItem={null}
                {...state}
                getStatus={() => makePromise({})}
            />,
        )
        const staged = container.find(Staged)
        expect(staged.length).toBe(1)
        const untrackedAndModified = container.find(VersionControlStatus)
        expect(untrackedAndModified.length).toBe(2)
        const commits = container.find(Commits)
        expect(commits.length).toBe(1)
    })

    it("shouldn't show a section if it has no content", () => {
        const wrapper = shallow(
            <VersionControlStatus
                onClick={noop}
                toggleVisibility={noop}
                visibility={true}
                titleId="modified"
                selectedId="file1"
                icon="M"
                files={null}
            />,
        )
        expect(wrapper.find(SectionTitle).length).toBe(0)
    })

    it("should match the last recorded snapshot unless a change was made", () => {
        const wrapper = shallow(
            <VersionControlStatus
                titleId="modified"
                visibility={true}
                toggleVisibility={noop}
                onClick={noop}
                selectedId="file1"
                icon="M"
                files={["test1", "test2"]}
            />,
        )
        expect(shallowToJson(wrapper)).toMatchSnapshot()
    })

    // it("render the correct number of modified files", () => {
    //     const stateCopy = {
    //         ...DefaultState,
    //         activated: true,
    //         hasFocus: true,
    //         status: {
    //             currentBranch: null,
    //             staged: [],
    //             conflicted: [],
    //             created: [],
    //             modified: ["test1", "test2"],
    //             remoteTrackingBranch: null,
    //             deleted: [],
    //             untracked: [],
    //             ahead: null,
    //             behind: null,
    //         },
    //     }
    //
    //     const statusComponent = shallow(
    //         <VersionControlView
    //             showHelp={false}
    //             selectedItem={null}
    //             committing={false}
    //             cancelCommit={noop}
    //             updateCommitMessage={noop}
    //             commits={[]}
    //             message={[]}
    //             {...stateCopy}
    //             getStatus={() => makePromise({})}
    //         />,
    //     )
    //         .dive()
    //         .dive()
    //         .findWhere(component => {
    //             console.log("component: ", component)
    //             return component.prop("titleId") === "modified"
    //         })
    //
    //     expect(statusComponent.prop("files").length).toBe(2)
    // })
})
