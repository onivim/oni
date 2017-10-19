/**
 * QuickInfoReducers.ts
 */

import * as Actions from "./../Actions"

import { locatableHigherOrderReducer } from "./LocatableReducer"

export const quickInfoReducer = (s: Oni.Plugin.QuickInfo, a: Actions.SimpleAction): Oni.Plugin.QuickInfo => {
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
