import { shallow, mount } from "enzyme"
import * as React from "react"

import { Sessions, Container } from "./../browser/src/Services/Sessions/Sessions"
import TextInputView from "../browser/src/UI/components/LightweightText"

const noop = () => ({})

jest.mock("./../browser/src/neovim/SharedNeovimInstance", () => ({
    getInstance: () => ({
        bindToMenu: () => ({
            setItems: jest.fn(),
            onCursorMoved: {
                subscribe: jest.fn(),
            },
        }),
    }),
}))

describe("<Sessions />", () => {
    const sessions = [
        {
            name: "test",
            id: "test-1",
            file: "/sessions/test.vim",
            directory: "/sessions",
            updatedAt: null as any,
            workspace: "/workspace",
        },
        {
            name: "testing",
            id: "testing-2",
            file: "/sessions/testing.vim",
            directory: "/sessions",
            updatedAt: null as any,
            workspace: "/workspace",
        },
    ]
    it("should render without crashing", () => {
        shallow(
            <Sessions
                active
                cancelCreating={noop}
                createSession={noop}
                persistSession={noop}
                restoreSession={noop}
                updateSession={noop}
                getAllSessions={noop}
                updateSelection={noop}
                sessions={sessions}
                creating={false}
                selected={sessions[0]}
                populateSessions={noop}
            />,
        )
    })
    it("should render no children if showAll is false", () => {
        const wrapper = shallow(
            <Sessions
                active
                cancelCreating={noop}
                createSession={noop}
                persistSession={noop}
                restoreSession={noop}
                updateSession={noop}
                getAllSessions={noop}
                updateSelection={noop}
                sessions={sessions}
                creating={false}
                selected={sessions[0]}
                populateSessions={noop}
            />,
        )
        wrapper.setState({ showAll: false })
        const items = wrapper
            .dive()
            .find("ul")
            .children()
        expect(items.length).toBe(0)
    })

    it("should render correct number of children if showAll is true", () => {
        const wrapper = mount(
            <Sessions
                active
                cancelCreating={noop}
                createSession={noop}
                persistSession={noop}
                restoreSession={noop}
                updateSession={noop}
                getAllSessions={noop}
                updateSelection={noop}
                sessions={sessions.slice(1)} // remove one session
                creating={false}
                selected={sessions[0]}
                populateSessions={noop}
            />,
        )
        wrapper.setState({ showAll: true })
        const items = wrapper.find("ul").children()
        expect(items.length).toBe(3)
    })

    it("should render an input if creating is true", () => {
        const wrapper = mount(
            <Sessions
                active
                cancelCreating={noop}
                createSession={noop}
                persistSession={noop}
                restoreSession={noop}
                updateSession={noop}
                getAllSessions={noop}
                updateSelection={noop}
                sessions={sessions.slice(1)} // remove one session
                creating={true}
                selected={sessions[0]}
                populateSessions={noop}
            />,
        )
        const hasInput = wrapper.find(TextInputView).length

        expect(hasInput).toBeTruthy()
    })

    it("should render no input if creating is false", () => {
        const wrapper = mount(
            <Sessions
                active
                cancelCreating={noop}
                createSession={noop}
                persistSession={noop}
                restoreSession={noop}
                updateSession={noop}
                getAllSessions={noop}
                updateSelection={noop}
                sessions={sessions.slice(1)}
                creating={false}
                selected={null}
                populateSessions={noop}
            />,
        )
        const hasInput = wrapper.find(TextInputView).length

        expect(hasInput).toBeFalsy()
    })

    it("should empty message if there are no sessions", () => {
        const wrapper = mount(
            <Sessions
                active
                cancelCreating={noop}
                createSession={noop}
                persistSession={noop}
                restoreSession={noop}
                updateSession={noop}
                getAllSessions={noop}
                updateSelection={noop}
                sessions={[]}
                creating={true}
                selected={null}
                populateSessions={noop}
            />,
        )
        expect(wrapper.find(Container).length).toBe(1)
        expect(wrapper.find(Container).text()).toBe("No Sessions Saved")
    })
})
