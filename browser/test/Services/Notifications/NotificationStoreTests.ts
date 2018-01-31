import * as assert from "assert"

import { createStore } from "./../../../src/Services/Notifications/NotificationStore"

describe("NotificationStore", () => {
    it("'SHOW_NOTIFICATION' adds a notification store", () => {
        const store = createStore()

        // tslint:disable-next-line
        const testFunc = () => {}

        store.dispatch({
            type: "SHOW_NOTIFICATION",
            id: "test_notification",
            title: "title-test",
            detail: "detail-test",
            level: "info",
            onClick: testFunc,
            onClose: testFunc,
        })

        const state = store.getState()

        assert.deepEqual(state.notifications, {
            ["test_notification"]: {
                id: "test_notification",
                title: "title-test",
                detail: "detail-test",
                level: "info",
                onClick: testFunc,
                onClose: testFunc,
            },
        })
    })

    it("'HIDE_NOTIFICATION' removes a notification from the store", () => {
        const store = createStore()

        store.dispatch({
            type: "SHOW_NOTIFICATION",
            id: "test_notification",
            title: "title-test",
            detail: "detail-test",
            level: "info",
        })

        store.dispatch({
            type: "HIDE_NOTIFICATION",
            id: "test_notification",
        })

        const state = store.getState()

        assert.deepEqual(
            state.notifications,
            { test_notification: null },
            "Validate notification was removed",
        )
    })
})
