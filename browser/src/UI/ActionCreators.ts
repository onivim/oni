import * as State from "./State"
import * as Action from "./Actions"

export const setCursorPosition = (cursorPixelX, cursorPixelY, fontPixelWidth, fontPixelHeight) => ({
    type: "SET_CURSOR_POSITION",
    payload: {
        pixelX: cursorPixelX,
        pixelY: cursorPixelY,
        fontPixelWidth: fontPixelWidth,
        fontPixelHeight: fontPixelHeight
    }
})

export const showMenu = (id: string, options: Oni.Menu.MenuOption[]) => ({
    type: "SHOW_MENU",
    payload: {
        id: id,
        options: options
    }
})

export const hideMenu = () => ({
    type: "HIDE_MENU"
})

export const previousMenu = () => ({
    type: "PREVIOUS_MENU"
})

export const filterMenu = (filterString: string) => ({
    type: "FILTER_MENU",
    payload: {
        filter: filterString
    }
})


export const nextMenu = () => ({
    type: "NEXT_MENU"
})

export const showQuickInfo = (title: string, description: string) => ({
    type: "SHOW_QUICK_INFO",
    payload: {
        title: title,
        description: description
    }
})

export const showAutoCompletion = (base: string, entries: Oni.Plugin.CompletionInfo[]) => ({
    type: "SHOW_AUTO_COMPLETION",
    payload: {
        base: base,
        entries: entries
    }
})

export const setAutoCompletionDetails = (detailedEntry: Oni.Plugin.CompletionInfo) => ({
    type: "SET_AUTO_COMPLETION_DETAILS",
    payload: {
        detailedEntry: detailedEntry
    }
})

export const nextAutoCompletion = () => ({
    type: "NEXT_AUTO_COMPLETION"
})

export const previousAutoCompletion = () => ({
    type: "PREVIOUS_AUTO_COMPLETION"
})

export const hideAutoCompletion = () => ({ type: "HIDE_AUTO_COMPLETION" })

export const hideQuickInfo = () => ({ type: "HIDE_QUICK_INFO"})
