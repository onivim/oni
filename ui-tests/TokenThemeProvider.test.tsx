import * as React from "react"
import { mount } from "enzyme"

import TokenThemeProvider from "./../browser/src/Services/SyntaxHighlighting/TokenThemeProvider"
import { TokenColor } from "./../browser/src/Services/TokenColors"
import styled from "./../browser/src/UI/components/common"

const tokenColors: TokenColor[] = [
    {
        scope: "string-quoted",
        settings: {
            foreground: "green",
            background: "blue",
            fontStyle: "italic",
        },
    },
]

const TestStyledComponent = styled<{ tokenStyles: any }, "div">("div")`
    ${p => p.tokenStyles};
`

describe("<TokenThemeProvider />", () => {
    const theme = {
        "editor.background": "black",
        "editor.foreground": "white",
    }

    const component = (
        <TokenThemeProvider
            theme={theme}
            tokenColors={tokenColors}
            render={props => (
                <TestStyledComponent tokenStyles={props.styles}>
                    {JSON.stringify(props.styles, null, 2)}
                </TestStyledComponent>
            )}
        />
    )

    it("should render without crashing", () => {
        const wrapper = mount(component)
        expect(wrapper.length).toBe(1)
    })

    it("should get the correct token styles", () => {
        const wrapper = mount(component)
        expect(wrapper.find(TestStyledComponent).prop("tokenStyles")).toBeTruthy()
    })

    // it("should have the correct classname for styling", () => {
    //     const wrapper = mount(component)
    //     console.log("wrapper.props(): ", wrapper.find(TestStyledComponent).props())
    //     expect(wrapper.find(TestStyledComponent).hasClass("string-quoted")).toEqual(true)
    // })
})
