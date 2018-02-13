import { shallow } from "enzyme"
import * as React from "react"
import { CommandLine } from "../CommandLine"

describe("<Commandline />: It should correctly mount the commandline component", () => {
    let wrapper: any

    beforeEach(() => {
        wrapper = shallow(
            <CommandLine
                showIcons={false}
                prompt={""}
                visible={true}
                content="hello world"
                position={0}
                firstchar="1"
                level={0}
            />,
        )
    })

    it("renders a shallow instance", () => {
        expect(wrapper.length).toEqual(1)
    })

    it("Contains an the correct text", () => {
        expect(wrapper.find("div#command-line-output").prop("content")).toEqual("hello world")
    })

    // it("mounts without crashing", () => {
    //     mount(<CommandLine />)
    // })

    // it("Renders Without Exploding", () => {
    //     const wrapper = shallow(<CommandLine />)
    //     expect(wrapper.find(<CommandLine />).length)
    // })
})
