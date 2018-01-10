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

export const RequestAnimationFrameNotifyBatcher = () => {
    let rafId: number = null

    return (notify: NotifyFunction) => {
        if (rafId) {
            return
        }

        rafId = window.requestAnimationFrame(() => {
            rafId = null
            notify()
        })
    }
}
