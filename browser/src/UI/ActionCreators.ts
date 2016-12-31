export const setCursorPosition = (cursorPixelX: any, cursorPixelY: any, fontPixelWidth: any, fontPixelHeight: any, cursorPixelWidth: number) => ({
    type: "SET_CURSOR_POSITION",
    payload: {
        pixelX: cursorPixelX,
        pixelY: cursorPixelY,
        fontPixelWidth,
        fontPixelHeight,
        cursorPixelWidth,
    },
})

export const setMode = (mode: string) => ({
    type: "SET_MODE",
    payload: { mode },
})

export const setColors = (foregroundColor: string) => ({
    type: "SET_COLORS",
    payload: { foregroundColor },
})

export const showSignatureHelp = (signatureHelpResult: Oni.Plugin.SignatureHelpResult) => ({
    type: "SHOW_SIGNATURE_HELP",
    payload: signatureHelpResult,
})

export const hideSignatureHelp = () => ({
    type: "HIDE_SIGNATURE_HELP",
})

export const showMenu = (id: string, options: Oni.Menu.MenuOption[]) => ({
    type: "SHOW_MENU",
    payload: {
        id,
        options,
    },
})

export const hideMenu = () => ({
    type: "HIDE_MENU",
})

export const previousMenu = () => ({
    type: "PREVIOUS_MENU",
})

export const filterMenu = (filterString: string) => ({
    type: "FILTER_MENU",
    payload: {
        filter: filterString,
    },
})

export const nextMenu = () => ({
    type: "NEXT_MENU",
})

export const showQuickInfo = (title: string, description: string) => ({
    type: "SHOW_QUICK_INFO",
    payload: {
        title,
        description,
    },
})

export const showAutoCompletion = (base: string, entries: Oni.Plugin.CompletionInfo[]) => ({
    type: "SHOW_AUTO_COMPLETION",
    payload: {
        base,
        entries,
    },
})

export const setAutoCompletionDetails = (detailedEntry: Oni.Plugin.CompletionInfo) => ({
    type: "SET_AUTO_COMPLETION_DETAILS",
    payload: {
        detailedEntry,
    },
})

export const nextAutoCompletion = () => ({
    type: "NEXT_AUTO_COMPLETION",
})

export const previousAutoCompletion = () => ({
    type: "PREVIOUS_AUTO_COMPLETION",
})

export const hideAutoCompletion = () => ({ type: "HIDE_AUTO_COMPLETION" })

export const hideQuickInfo = () => ({ type: "HIDE_QUICK_INFO" })
