/*
 * RAFNotifyBatcher
 *
 * Helper method to 'batch' dispatches to redux store
 * subscriptions, based on animation frames.
 *
 * This helps 'debounce' the rendering logic -
 * otherwise we'd be re-rendering the UI every time
 * an action is dispatched.
 */

import { NotifyFunction } from "redux-batched-subscribe"

let rafId: number = null

export const RequestAnimationFrameNotifyBatcher = (notify: NotifyFunction) => {
    if (rafId) {
        return
    }

    rafId = window.requestAnimationFrame(() => {
        rafId = null
        notify()
    })
}
