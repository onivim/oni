import * as React from "react"
import { mount } from "enzyme"

import TokenThemeProvider from "./../browser/src/Services/SyntaxHighlighting/TokenThemeProvider"
import { TokenColor } from "./../browser/src/Services/TokenColors"

jest.mock("./../browser/src/Services/TokenColors", () => ({
    getInstance: () => ({
        tokenColors: [
            {
                scope: "string",
                settings: {
                    foreground: "green",
                    background: "blue",
                    fontStyle: "italic",
                },
            },
        ],
    }),
}))

describe("<TokenThemeProvider />", () => {
    const TestElement: React.SFC<{ tokenStyles: any }> = props => (
        <div>{JSON.stringify(props.tokenStyles, null, 2)}</div>
    )

    const theme = {
        "editor.background": "black",
        "editor.foreground": "white",
    }

    const component = (
        <TokenThemeProvider
            theme={theme}
            render={({ styles }) => <TestElement tokenStyles={styles}>"text"</TestElement>}
        />
    )

    it("should render without crashing", () => {
        const wrapper = mount(component)
        expect(wrapper.length).toBe(1)
    })
})
