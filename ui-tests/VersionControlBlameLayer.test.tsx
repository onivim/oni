import { shallow, mount } from "enzyme"
import * as React from "react"

import { LayerContextWithCursor } from "./../browser/src/Editor/NeovimEditor/NeovimBufferLayersView"
import {
    Blame,
    BlameContainer,
    IProps,
    IState,
} from "./../browser/src/Services/VersionControl/VersionControlBlameLayer"

jest.mock("react-transition-group", () => {
    const React = require("react") // tslint:disable-line
    // IMPORTANT: transition here implies a render props
    const FakeTransition = jest.fn(({ children }) => children())
    const FakeCSSTransition = jest.fn(
        props => (props.in ? <FakeTransition>{props.children}</FakeTransition> : null),
    )
    return { CSSTransition: FakeCSSTransition, Transition: FakeTransition }
})

describe("<VersionControlBlameLayer />", () => {
    const blame = {
        author: "ernest hemmingway",
        author_mail: "ernie@h.com",
        author_time: "342423423424",
        author_tz: "+ 100",
        committer: "ernie",
        committer_mail: "ernie@h.com",
        committer_time: "342423423424",
        committer_tz: "+ 100",
        filename: "moby_dick.txt",
        hash: "223423423442434234",
        line: { originalLine: "1", finalLine: "1", numberOfLines: "1" },
        summary: "the first paragraph",
    }
    const getBlame = jest.fn().mockReturnValue(blame)
    const context: LayerContextWithCursor = {
        isActive: true,
        windowId: 1,
        fontPixelWidth: 3,
        fontPixelHeight: 10,
        cursorColumn: 4,
        cursorLine: 2,
        bufferToScreen: jest.fn(),
        screenToPixel: jest.fn(),
        bufferToPixel: jest.fn(),
        dimensions: {
            width: 100,
            height: 100,
            x: 0,
            y: 0,
        },
        visibleLines: ["test string", "test string", "test string"],
        topBufferLine: 20,
        bottomBufferLine: 40,
    }
    const wrapper = shallow<IProps, IState>(
        <Blame
            mode="auto"
            timeout={0}
            {...context}
            getBlame={getBlame}
            setupCommand={jest.fn()}
            cursorScreenLine={context.cursorLine - context.topBufferLine}
            cursorBufferLine={context.cursorLine + 1}
            currentLine={context.visibleLines[2]}
            fontFamily="arial"
        />,
    )
    it("should render without crashing", () => {
        expect(wrapper.length).toBe(1)
    })
    it("should render the component if there is a blame present and show blame is true", () => {
        const mounted = mount<IProps, IState>(
            <Blame
                mode="auto"
                timeout={0}
                {...context}
                getBlame={getBlame}
                setupCommand={jest.fn()}
                cursorScreenLine={context.cursorLine - context.topBufferLine}
                cursorBufferLine={context.cursorLine + 1}
                currentLine={context.visibleLines[2]}
                fontFamily="arial"
            />,
        )
        mounted.setState({ showBlame: true, blame })
        console.log(mounted.find(BlameContainer))
        expect(mounted.find(BlameContainer).length).toBe(1)
    })
})
