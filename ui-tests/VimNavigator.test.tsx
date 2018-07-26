import * as React from "react"
import { shallow } from "enzyme"

import { VimNavigator } from "../browser/src/UI/components/VimNavigator"

describe("<VimNavigator />", () => {
    let wrapper: any
    let onSelectionChanged: jest.Mock

    beforeEach(() => {
        onSelectionChanged = jest.fn()
        wrapper = shallow(
            <VimNavigator
                ids={["a", "b"]}
                active={false}
                render={jest.fn()}
                onSelectionChanged={onSelectionChanged}
            />,
        )
    })

    it("should have undefined idToSelect by default", () => {
        expect(wrapper.state().selectedId).toEqual("a")
        expect(wrapper.props().idToSelect).toBeUndefined()
    })

    it("should update selectedId and call onSelectionChanged when idToSelect changes", () => {
        wrapper.setProps({ idToSelect: "b" })

        expect(wrapper.state().selectedId).toEqual("b")
        expect(onSelectionChanged).toHaveBeenCalledWith("b")
    })

    it("should not call onSelectionChanged if idToSelect matches current selectedId", () => {
        wrapper.setProps({ idToSelect: "a" })

        expect(wrapper.state().selectedId).toEqual("a")
        expect(onSelectionChanged).not.toHaveBeenCalled()
    })
})
