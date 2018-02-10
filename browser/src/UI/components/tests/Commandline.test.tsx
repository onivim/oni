import { expect } from "chai"
import { mount } from "enzyme"
import * as React from "react"
import renderer from "react-test-renderer"
import { spy } from "sinon"
import CommandLine from "./Commandline"

spy(CommandLine.prototype, "componentDidMount")

test("<Commandline />: It should correctly mount the commandline component", () => {
    it("calls componentDidMount", () => {
        const wrapper = mount(<CommandLine />)
        expect(CommandLine.prototype.componentDidMount.calledOnce).to.equal(true)
    })
})
