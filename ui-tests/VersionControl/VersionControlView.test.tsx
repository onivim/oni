import { shallow, mount } from "enzyme"
import { shallowToJson } from "enzyme-to-json"
import * as React from "react"

import {
    DefaultState,
    VersionControlState,
} from "./../../browser/src/Services/VersionControl/VersionControlStore"
import { VersionControlView } from "./../../browser/src/Services/VersionControl/VersionControlView"
import CommitMessage, {
    Explainer,
} from "./../../browser/src/UI/components/VersionControl/CommitMessage"
import Commits from "./../../browser/src/UI/components/VersionControl/Commits"
import Help from "./../../browser/src/UI/components/VersionControl/Help"
import { SectionTitle } from "./../../browser/src/UI/components/VersionControl/SectionTitle"
import Staged, { LoadingHandler } from "./../../browser/src/UI/components/VersionControl/Staged"
import VersionControlStatus from "./../../browser/src/UI/components/VersionControl/Status"

const noop = jest.fn()

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

const IDs: any = {
    modified: "modified",
    commits: "commits",
    untracked: "untracked",
    staged: "staged",
    commitAll: "commit_all",
}

const makePromise = (arg?: any) => Promise.resolve(arg)

jest.mock("../../browser/src/UI/components/Sneakable", () => {
    const React = require("react") // tslint:disable-line
    return { Sneakable: () => <div /> }
})

describe("<VersionControlView />", () => {
    const state = { ...DefaultState, activated: true, hasFocus: true }
    const container = shallow(
        <VersionControlView
            {...state}
            IDs={IDs}
            showHelp={true}
            committing={false}
            cancelCommit={noop}
            updateCommitMessage={noop}
            commits={[]}
            message={[]}
            selectedItem={null}
            loadingSection={null}
            loading={false}
            getStatus={() => makePromise({})}
        />,
    )
    it("renders without crashing", () => {
        expect(container.length).toBe(1)
    })

    it("should render an untracked, staged and modified section", () => {
        const container = mount(
            <VersionControlView
                {...state}
                IDs={IDs}
                loading={false}
                loadingSection={null}
                showHelp={false}
                committing={false}
                cancelCommit={noop}
                updateCommitMessage={noop}
                commits={[]}
                message={[]}
                selectedItem={null}
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

    it("Should render only the title if not visible", () => {
        const wrapper = mount(
            <Staged
                files={[]}
                titleId="staged"
                visible={false}
                handleCommitOne={jest.fn()}
                handleCommitMessage={jest.fn()}
                handleCommitCancel={jest.fn()}
                handleCommitAll={jest.fn()}
                toggleVisibility={noop}
                selectedId="commit_all"
                icon="cross"
                loading={false}
                handleSelection={noop}
            />,
        )

        expect(wrapper.find(SectionTitle).length).toBe(1)
        expect(wrapper.children.length).toBe(1)
    })

    it("should render a loading spinner if loading is true", () => {
        const wrapper = mount(
            <Staged
                files={["test.txt"]}
                selectedToCommit={() => false}
                titleId="staged"
                visible
                handleCommitOne={jest.fn()}
                handleCommitMessage={jest.fn()}
                handleCommitCancel={jest.fn()}
                handleCommitAll={jest.fn()}
                toggleVisibility={noop}
                selectedId="commit_all"
                icon="cross"
                loading
                handleSelection={noop}
            />,
        )
        expect(wrapper.find(LoadingHandler).length).toBe(2)
    })
    it("should render an in place of the commit all explainer", () => {
        const wrapper = mount(
            <Staged
                files={["test.txt"]}
                selectedToCommit={() => true}
                titleId="staged"
                visible
                handleCommitOne={jest.fn()}
                handleCommitMessage={jest.fn()}
                handleCommitCancel={jest.fn()}
                handleCommitAll={jest.fn()}
                toggleVisibility={noop}
                selectedId="commit_all"
                icon="cross"
                loading
                handleSelection={noop}
            />,
        )
        expect(wrapper.find(CommitMessage).length).toBe(1)
    })
    it("should render help if show help is true", () => {
        expect(container.find(Help).length).toBe(1)
    })
})
