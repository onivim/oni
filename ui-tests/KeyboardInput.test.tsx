import { shallow, ShallowWrapper } from "enzyme"
import * as React from "react"
import { Event } from "oni-types"

import { KeyboardInputView } from "../browser/src/Input/KeyboardInput"
jest.mock("../browser/src/Services/FocusManager")
import { focusManager } from "../browser/src/Services/FocusManager"

describe("<KeyboardInputView />", () => {
    describe("onActivate", () => {
        let wrapper: ShallowWrapper
        let onActivate: Event<void>
        beforeEach(() => {
            onActivate = new Event()
            wrapper = shallow(
                <KeyboardInputView
                    top={10}
                    left={10}
                    height={100}
                    foregroundColor={"#fffff"}
                    fontFamily={"Courier New"}
                    fontSize={"10"}
                    fontCharacterWidthInPixels={10}
                    onActivate={onActivate}
                />,
            )
            wrapper.instance()["_keyboardElement"] = "MockElement" as any
        })

        it("pushes cursor focus to it's element", () => {
            expect(focusManager.pushFocus).not.toBeCalled()
            onActivate.dispatch()
            expect(focusManager.pushFocus).toHaveBeenCalledWith("MockElement")
        })
    })
})
