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
            fontStyle: "bold italic",
        },
    },
    {
        scope: "entity.name.struct",
        settings: {
            foreground: "rebeccapurple",
            background: "orange",
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

    test.each`
      className                | cssRule         | result
      ${".string-quoted"}      | ${"color"}      | ${"green"}
      ${".string-quoted"}      | ${"font-style"} | ${"italic"}
      ${".string-quoted"}      | ${"font-weight"}| ${"bold"}
      ${".entity-name-struct"} | ${"color"}      | ${"rebeccapurple"}
      ${".entity-name-struct"} | ${"font-style"} | ${"italic"}
      ${".entity-name-struct"} | ${"font-weight"}| ${undefined}
    `(
        "returns $result when the style is $cssRule for $className",
        ({ cssRule, result, className }) => {
            const wrapper = mount(component)
            expect(wrapper.find(TestComponent)).toHaveStyleRule(cssRule, result, {
                modifier: className,
            })
        },
    )
})
