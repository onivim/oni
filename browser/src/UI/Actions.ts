import * as State from "./State"

export interface SetCursorPositionAction {
    type: "SET_CURSOR_POSITION",
    payload: {
        pixelX: number,
        pixelY: number,
        fontPixelWidth: number,
        fontPixelHeight: number
    }
}

export interface ShowMenuAction {
    type: "SHOW_MENU",
    payload: {
        id: string
        options: Oni.Menu.MenuOption[]
    }
}

export interface FilterMenuAction {
    type: "FILTER_MENU",
    payload: {
        filter: string
    }
}

export interface HideMenuAction {
    type: "HIDE_MENU"
}

export interface NextMenuAction {
    type: "NEXT_MENU"
}

export interface PreviousMenuAction {
    type: "PREVIOUS_MENU"
}

export interface ShowQuickInfoAction {
    type: "SHOW_QUICK_INFO",
    payload: {
        title: string
        description: string
    }
}

export interface ShowAutoCompletionAction {
    type: "SHOW_AUTO_COMPLETION",
    payload: {
        base: string
        entries: Oni.Plugin.CompletionInfo[]
    }
}

export interface SetAutoCompletionDetails {
    type: "SET_AUTO_COMPLETION_DETAILS",
    payload: {
        detailedEntry: Oni.Plugin.CompletionInfo
    }
}

export interface HideAutoCompletionAction {
    type: "HIDE_AUTO_COMPLETION"
}

export interface NextAutoCompletionAction {
    type: "NEXT_AUTO_COMPLETION"
}

export interface PreviousAutoCompletionAction {
    type: "PREVIOUS_AUTO_COMPLETION"
}

export interface HideQuickInfoAction {
    type: "HIDE_QUICK_INFO"
}

export type Action = SetCursorPositionAction | ShowQuickInfoAction | HideQuickInfoAction | ShowAutoCompletionAction | HideAutoCompletionAction | NextAutoCompletionAction | PreviousAutoCompletionAction | SetAutoCompletionDetails | ShowMenuAction | HideMenuAction | PreviousMenuAction | NextMenuAction | FilterMenuAction
