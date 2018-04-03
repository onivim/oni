import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"
import * as React from "react"

import { Event } from "oni-types"
import {
    BrowserView,
    IBrowserViewProps,
    IBrowserViewState,
} from "../browser/src/Services/Browser/BrowserView"
import { Configuration } from "../browser/src/Services/Configuration"

const mockEvent = new Event<void>()

const MockWebviewElement = {
    sendInputEvent({ type, keyCode, canScroll, modifiers }) {
        jest.fn()
    },
}

// Using the disable life cycle methods here as the CDM calls sneak which is
// an external dependency I'm not trying to test here

describe("<BrowserView /> Tests", () => {
    BrowserView._webviewElement = MockWebviewElement
    const component = (
        <BrowserView
            initialUrl={"test.com"}
            configuration={{} as Configuration}
            debug={mockEvent}
            goBack={mockEvent}
            goForward={mockEvent}
            reload={mockEvent}
            scrollUp={mockEvent}
            scrollLeft={mockEvent}
            scrollRight={mockEvent}
            scrollDown={mockEvent}
        />
    )
    const wrapper = shallow<IBrowserViewProps, IBrowserViewState>(component, {
        disableLifecycleMethods: true,
    })
    // can be typed here but the _webviewComponent is expected - TS Error
    const instance: any = wrapper.instance()
    it("component to render correctly", () => {
        expect(wrapper).toBeDefined()
    })
    it('Should correctly prefix a url with "https" or "http" if needed', () => {
        expect(instance.prefixUrl("apple.com")).toBe("http://apple.com")
    })
    it('Should NOT prefix a url with "https" or "http" if already present', () => {
        // subtle difference here as the function always add https as a prefix not http
        expect(instance.prefixUrl("https://www.apple.com")).toBe("https://www.apple.com")
    })

    it("Should match the recent snapshot - unless an intentional change has occurred ", () => {
        expect(shallowToJson(wrapper)).toMatchSnapshot()
    })
    it("it should call the sendInputEvent method of the mocked webview element", () => {
        const spy = jest.spyOn(BrowserView.prototype, "scrollDown")
        instance._scrollDown()
        expect(instance._scrollDown).toHaveBeenCalled()
    })
})
