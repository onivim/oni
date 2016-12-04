export interface State {
    cursorPixelX: number
    cursorPixelY: number
    fontPixelWidth: number
    fontPixelHeight: number
    autoCompletion: null | AutoCompletionInfo
    quickInfo: null | Oni.Plugin.QuickInfo
    popupMenu: null | Menu
    signatureHelp: null | Oni.Plugin.SignatureHelpResult
}

export interface Menu {
    filter: string,
    filteredOptions: MenuOptionWithHighlights[],
    options: Oni.Menu.MenuOption[],
    selectedIndex: number
}

export interface MenuOptionWithHighlights extends Oni.Menu.MenuOption {
    labelHighlights: number[],
    detailHighlights: number[]
}

export interface AutoCompletionInfo {

    /**
     * Base entry being completed against
     */
    base: string;

    entries: Oni.Plugin.CompletionInfo[]

    /**
     * Label of selected entry
     */
    selectedIndex: number;
}
