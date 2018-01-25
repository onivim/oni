import * as assert from "assert"

import { createStore, Notification } from "./../../../src/Services/Notifications/NotificationStore"

describe("NotificationStore", () => {

    it("'SHOW_NOTIFICATION' adds a notification store", () => {
        const store = createStore()

        store.dispatch({
            type: "SHOW_NOTIFICATION",
            id: "test_notification",
            title: "title-test",
            detail: "detail-test",
            level: "info"
        })

        const state = store.getState()

        assert.deepEqual(state.notifications, {
            ["test_notification"]: {
                id: "test_notification",
                title: "title-test",
                detail: "detail-test",
                level: "info",
            }
        })
    })

})
