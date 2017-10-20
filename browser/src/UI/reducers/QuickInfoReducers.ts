/**
 * QuickInfoReducers.ts
 */

import * as Actions from "./../Actions"
import * as State from "./../State"

import { locatableHigherOrderReducer } from "./LocatableReducer"

export const quickInfoReducer = (s: State.IQuickInfo, a: Actions.SimpleAction): State.IQuickInfo => {
    switch (a.type) {
        case "SHOW_QUICK_INFO":
            return {
                title: a.payload.title,
                description: a.payload.description,
            }
        default:
            return s
    }
}

export const quickInfoReducerWithLocation = locatableHigherOrderReducer(quickInfoReducer)
