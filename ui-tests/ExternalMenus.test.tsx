import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"
import * as React from "react"

import { ExternalMenus } from "./../browser/src/UI/components/ExternalMenus"

describe("<ExternalMenus />", () => {
    const wildMenu = {
        selected: 0,
        visible: false,
        options: ["test"],
    }

    const commandLine = {
        visible: true,
        content: "test",
        firstchar: "t",
        position: 0,
        prompt: ":",
        indent: 0,
        level: 0,
    }

    it("Should render without crashing", () => {
        const wrapper = shallow(<ExternalMenus commandLine={commandLine} wildmenu={wildMenu} />)
        expect(wrapper.length).toBe(1)
    })
    it("Should be present in the DOM even though hidden is true", () => {
        const hiddenCommandLine = { ...commandLine, visible: false }
        const wrapper = shallow(
            <ExternalMenus commandLine={hiddenCommandLine} wildmenu={wildMenu} />,
        )
        expect(wrapper.length).toBe(1)
    })
    it("Should match the last snapshot", () => {
        const wrapper = shallow(<ExternalMenus commandLine={commandLine} wildmenu={wildMenu} />)
        expect(shallowToJson(wrapper)).toMatchSnapshot()
    })
})
