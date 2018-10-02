import { WebviewTag } from "electron"
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

const MockWebviewElement = (spy: (args?: any) => void) =>
    ({
        sendInputEvent(args) {
            spy(args)
        },
    } as WebviewTag)

// Using the disable life cycle methods here as the CDM calls sneak which is
// an external dependency I'm not trying to test here

describe("<BrowserView /> Tests", () => {
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
    it("it should call the sendInputEvent method of the mocked webview element on Scroll down", () => {
        const typedInstance: BrowserView = instance
        const spy = jest.fn()
        typedInstance._webviewElement = MockWebviewElement(spy)
        typedInstance._scrollDown()
        // the spy is passed to the mocked webview element so given that it was called the method accurately
        // accessed the method on the webview
        expect(spy).toHaveBeenCalled()
        const args = {
            type: "keyDown",
            keyCode: "Down",
            canScroll: true,
            modifiers: ["isAutoRepeat"],
        }
        expect(spy.mock.calls[0][0]).toMatchObject(args)
    })
    it("it should call the sendInputEvent method of the mocked webview element on Scroll up", () => {
        const typedInstance: BrowserView = instance
        const spy = jest.fn()
        typedInstance._webviewElement = MockWebviewElement(spy)
        typedInstance._scrollUp()
        // the spy is passed to the mocked webview element so given that it was called the method accurately
        // accessed the method on the webview
        expect(spy).toHaveBeenCalled()
        const args = {
            type: "keyDown",
            keyCode: "Up",
            canScroll: true,
            modifiers: ["isAutoRepeat"],
        }
        expect(spy.mock.calls[0][0]).toMatchObject(args)
    })
    it("it should call the sendInputEvent method of the mocked webview element on Scroll left", () => {
        const typedInstance: BrowserView = instance
        const spy = jest.fn()
        typedInstance._webviewElement = MockWebviewElement(spy)
        typedInstance._scrollLeft()
        expect(spy).toHaveBeenCalled()
        const args = {
            type: "keyDown",
            keyCode: "Left",
            canScroll: true,
            modifiers: ["isAutoRepeat"],
        }
        expect(spy.mock.calls[0][0]).toMatchObject(args)
    })
    it("it should call the sendInputEvent method of the mocked webview element on Scroll right", () => {
        const typedInstance: BrowserView = instance
        const spy = jest.fn()
        typedInstance._webviewElement = MockWebviewElement(spy)
        typedInstance._scrollRight()
        expect(spy).toHaveBeenCalled()
        const args = {
            type: "keyDown",
            keyCode: "Right",
            canScroll: true,
            modifiers: ["isAutoRepeat"],
        }
        expect(spy.mock.calls[0][0]).toMatchObject(args)
    })
    it("it should NOT call the sendInputEvent method if no webview is present", () => {
        const typedInstance: BrowserView = instance
        const spy = jest.fn()
        typedInstance._webviewElement = null
        typedInstance._scrollDown()
        expect(spy.mock.calls.length).toBe(0)
    })
})
