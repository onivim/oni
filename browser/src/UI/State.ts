export interface IState {
    cursorPixelX: number
    cursorPixelY: number
    fontPixelWidth: number
    fontPixelHeight: number
    autoCompletion: null | IAutoCompletionInfo
    quickInfo: null | Oni.Plugin.QuickInfo
    popupMenu: null | IMenu
    signatureHelp: null | Oni.Plugin.SignatureHelpResult
}

export interface IMenu {
    filter: string,
    filteredOptions: IMenuOptionWithHighlights[],
    options: Oni.Menu.MenuOption[],
    selectedIndex: number
}

export interface IMenuOptionWithHighlights extends Oni.Menu.MenuOption {
    labelHighlights: number[],
    detailHighlights: number[]
}

export interface IAutoCompletionInfo {

    /**
     * Base entry being completed against
     */
    base: string

    entries: Oni.Plugin.CompletionInfo[]

    /**
     * Label of selected entry
     */
    selectedIndex: number
}
