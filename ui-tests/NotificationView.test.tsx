import { mount, shallow, configure } from "enzyme"
import { shallowToJson } from "enzyme-to-json"
import * as React from "react"

import styled from "styled-components"
import {
    Button,
    NotificationContents,
    NotificationDescription,
    NotificationTitle,
    NotificationView,
} from "./../browser/src/Services/Notifications/NotificationsView"

describe("<NotificationsView />", () => {
    const buttons = [
        {
            title: "yes",
            callback: () => ({}),
        },
        {
            title: "no",
            callback: () => ({}),
        },
    ]
    const Notification = (
        <NotificationView
            id="1"
            level="info"
            title="testing1"
            detail="this is a test"
            expirationTime={20000000}
            onClick={() => console.log("clicked")} //tslint:disable-line
            onClose={() => console.log("closed")} //tslint:disable-line
        />
    )

    const NotificationWithButtons = (
        <NotificationView
            id="1"
            level="info"
            title="testing1"
            detail="this is a test"
            expirationTime={20000000}
            onClick={() => console.log("clicked")} //tslint:disable-line
            onClose={() => console.log("closed")} //tslint:disable-line
            buttons={buttons}
        />
    )
    it("It renders a notification component correctly", () => {
        const wrapper = shallow(Notification)
        expect(wrapper.length).toEqual(1)
    })

    it("Renders the correct title", () => {
        const wrapper = shallow(Notification)
        expect(
            wrapper
                .find(NotificationTitle)
                .dive()
                .text(),
        ).toEqual("testing1")
    })

    it("Renders the correct text", () => {
        const wrapper = shallow(Notification)
        expect(
            wrapper
                .find(NotificationContents)
                .dive()
                .find(NotificationDescription)
                .dive()
                .text(),
        ).toEqual("this is a test")
    })

    it("should match the snapshot", () => {
        const wrapper = shallow(Notification)
        expect(shallowToJson(wrapper)).toMatchSnapshot()
    })

    it("Renders buttons with correct text when passed button fields", () => {
        const wrapper = shallow(NotificationWithButtons)
        expect(wrapper.contains([<Button>yes</Button>, <Button>no</Button>]))
    })
})
