import { expect } from "chai"
import { /* mount, */ shallow } from "enzyme"
import * as React from "react"
// import * as renderer from "react-test-renderer"
import { spy } from "sinon"
import CommandLine from "./../CommandLine"

spy(CommandLine.prototype, "componentDidMount")

describe("<Commandline />: It should correctly mount the commandline component", () => {
    it("calls componentDidMount", () => {
        expect(CommandLine.prototype.componentDidMount.calledOnce).to.equal(true)
        // expect(wrapper).to.exist()
        // const wrapper = mount(<CommandLine />)
    })

    it("Renders Without Exploding", () => {
        const wrapper = shallow(<CommandLine />)
        expect(wrapper.find(<CommandLine />).length).to.equal(1)
    })
})
