import * as React from "react"
import { mount } from "enzyme"
import "jest-styled-components"

import TokenThemeProvider from "./../browser/src/Services/SyntaxHighlighting/TokenThemeProvider"
import { TokenColor } from "./../browser/src/Services/TokenColors"
import styled, { css } from "./../browser/src/UI/components/common"

const tokenColors: TokenColor[] = [
    {
        scope: "string.quoted",
        settings: {
            foreground: "green",
            background: "blue",
            fontStyle: "italic",
        },
    },
]

const TestComponent = styled<{ tokenStyles: any }, "div">("div")`
    ${p => p.tokenStyles};
`

describe("<TokenThemeProvider />", () => {
    const theme = {
        "editor.background": "black",
        "editor.foreground": "white",
        "menu.background": "green",
        "menu.foreground": "grey",
    }

    const component = (
        <TokenThemeProvider
            theme={theme}
            tokenColors={tokenColors}
            render={props => (
                <TestComponent tokenStyles={props.styles}>
                    <span className="string-quoted">test text</span>
                </TestComponent>
            )}
        />
    )

    it("should render without crashing", () => {
        const wrapper = mount(component)
        expect(wrapper.length).toBe(1)
    })

    it("should have the style rule of color green for the calls string-quoted", () => {
        const wrapper = mount(component)
        expect(wrapper.find(TestComponent)).toHaveStyleRule("color", "green", {
            modifier: `.string-quoted`,
        })
    })
})
