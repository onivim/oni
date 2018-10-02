import * as React from "react"
import { shallow } from "enzyme"
import { Diagnostic } from "vscode-languageserver-types"

import { ErrorInfo } from "../browser/src/UI/components/ErrorInfo"

describe("<ErrorInfo />", () => {
    const errors: Diagnostic[] = [
        {
            range: {
                start: {
                    line: 0,
                    character: 0,
                },
                end: {
                    line: 0,
                    character: 10,
                },
            },
            severity: 2,
            code: 5,
            source: "test",
            message: "an error here",
        },
    ]

    it("Should Render without crashing", () => {
        const wrapper = shallow(<ErrorInfo hasQuickInfo={true} errors={errors} />)
        expect(wrapper.length).toBe(1)
    })
    it("Should Not Render without Errors", () => {
        const wrapper = shallow(<ErrorInfo hasQuickInfo={false} errors={null} />)
        expect(wrapper.children().length).toBe(0)
    })
    it("Should render the correct diagnostic message", () => {
        const wrapper = shallow(<ErrorInfo hasQuickInfo={true} errors={errors} />)
        expect(wrapper.dive().find("[data-id='diagnostic-message']").length).toEqual(1)
        expect(
            wrapper
                .dive()
                .find("[data-id='diagnostic-message']")
                .dive()
                .text(),
        ).toBe(errors[0].message)
    })

    it("Should render the correct number of diagnostics", () => {
        const wrapper = shallow(
            <ErrorInfo hasQuickInfo={true} errors={[...errors, ...errors, ...errors]} />,
        )
        expect(wrapper.dive().find("[data-id='diagnostic-message']").length).toBe(3)
    })

    it("Should match the last snapshot on record unless a purposeful change was made", () => {
        const wrapper = shallow(
            <ErrorInfo hasQuickInfo={true} errors={[...errors, ...errors, ...errors]} />,
        )
        expect(wrapper).toMatchSnapshot()
    })
})
