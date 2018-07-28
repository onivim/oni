import { mount } from "enzyme"
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
        cursorLine: 30,
        bufferToScreen: jest.fn(),
        screenToPixel: jest.fn(),
        bufferToPixel: jest.fn().mockReturnValue({
            pixelX: 20,
            pixelY: 20,
        }),
        dimensions: {
            width: 100,
            height: 100,
            x: 0,
            y: 0,
        },
        visibleLines: [
            // Absolute line numbers
            "test string1", // line 20
            "test string2",
            "",
            "test string4",
            "test string5",
            "test string6",
            "test string7",
            "test string8",
            "test string9",
            "test string10",
            "test string11",
            "cursor", // line 22
            "test string13",
            "test string14",
            "test string15",
            "test string16",
            "test string17",
            "test string18",
            "test string19",
            "test string20", // line 40
        ],
        topBufferLine: 20,
        bottomBufferLine: 40,
    }
    const cursorBufferLine = context.cursorLine + 1
    const cursorScreenLine = cursorBufferLine - context.topBufferLine
    const wrapper = mount<IProps, IState>(
        <Blame
            mode="auto"
            timeout={0}
            {...context}
            getBlame={getBlame}
            setupCommand={jest.fn()}
            cursorScreenLine={cursorScreenLine}
            cursorBufferLine={cursorBufferLine}
            currentLine={context.visibleLines[cursorScreenLine]}
            fontFamily="arial"
        />,
    )

    const instance = wrapper.instance() as Blame

    afterEach(() => {
        wrapper.setProps({ ...context })
    })

    it("should render without crashing", () => {
        expect(wrapper.length).toBe(1)
    })
    it("should render the component if there is a blame present and show blame is true", () => {
        wrapper.setState({ showBlame: true, blame })
        expect(wrapper.find(BlameContainer).length).toBe(1)
    })
    it("should render the correct message", () => {
        const text = wrapper.find("span").text()
        expect(text).toMatch(/the first paragraph/)
    })
    it("should return a formatted hash in the message", () => {
        const text = wrapper.find("span").text()
        expect(text).toMatch(/#2234/)
    })
    it("should correctly return a position if the component is able to fit", () => {
        const position = instance.calculatePosition(true)
        expect(position).toEqual({ hide: false, top: 20, left: 20 })
    })
    it("should return a position with a prop of hide if the component cannot fit", () => {
        const position = instance.calculatePosition(false)
        wrapper.setProps({ cursorLine: 21, cursorScreenLine: 2 })
        expect(position).toEqual({ hide: true, top: null, left: null })
    })
    it("Should correctly determine if a line is out of bounds", () => {
        const outOfBounds = instance.isOutOfBounds(50, 10)
        expect(outOfBounds).toBe(true)
    })
    it("should return false if no lines passed are out of bounds", () => {
        const outOfBounds = instance.isOutOfBounds(22, 24)
        expect(outOfBounds).toBe(false)
    })
    it("should correctly truncate the blame text based on window width prop", () => {
        const expected = "ernest hemmingway, 2 days ago, the first... #2234"
        wrapper.setProps({ dimensions: { width: 60, height: 100, x: 0, y: 0 } })
        const { message, canFit, position } = instance.canFit()
        expect(message).toEqual(expected)
    })
    it("should have the correct current line", () => {
        const line = wrapper.prop("currentLine")
        expect(line).toBe("cursor")
    })
    it("should correctly identify the last empty line", () => {
        const { lastEmptyLine } = instance.getLastEmptyLine()
        expect(lastEmptyLine).toBe(22) // aka the 3 item in the array
    })
})
