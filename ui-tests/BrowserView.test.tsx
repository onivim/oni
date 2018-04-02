import { shallow } from "enzyme"
import * as React from "react"
import { shallowToJson } from "enzyme-to-json"

import { Event } from "oni-types"
import {
    BrowserView,
    IBrowserViewProps,
    IBrowserViewState,
} from "../browser/src/Services/Browser/BrowserView"
import { Configuration } from "../browser/src/Services/Configuration"

const mockEvent = new Event<void>()

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
        />
    )
    it("component to render correctly", () => {
        const wrapper = shallow(component, { disableLifecycleMethods: true })
        expect(wrapper).toBeDefined()
    })
    it('Should correctly prefix a url with "https" or "http" if needed', () => {
        const wrapper = shallow(component, { disableLifecycleMethods: true })
        // can be typed here but the _webviewComponent is expected - TS Error
        const instance: any = wrapper.instance()
        expect(instance.prefixUrl("apple.com")).toBe("http://apple.com")
    })
    it('Should NOT prefix a url with "https" or "http" if already present', () => {
        const wrapper = shallow(component, { disableLifecycleMethods: true })
        const instance: any = wrapper.instance()
        // subtle difference here as the function always add https as a prefix not http
        expect(instance.prefixUrl("https://www.apple.com")).toBe("https://www.apple.com")
    })

    it("Should match the recent snapshot - unless an intentional change has occurred ", () => {
        const wrapper = shallow(component, { disableLifecycleMethods: true })
        expect(shallowToJson(wrapper)).toMatchSnapshot()
    })
})
