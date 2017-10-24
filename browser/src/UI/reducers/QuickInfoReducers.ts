/**
 * QuickInfoReducers.ts
 */

import * as Actions from "./../Actions"
import * as State from "./../State"

export const quickInfoReducer = (s: State.IQuickInfo, a: Actions.SimpleAction): State.IQuickInfo => {
    switch (a.type) {
        case "SHOW_QUICK_INFO":
            return {
                title: a.payload.title,
                description: a.payload.description,
            }
        case "HIDE_QUICK_INFO":
            return null
        default:
            return s
    }
}
