export interface State {
    cursorPixelX: number
    cursorPixelY: number
    fontPixelWidth: number
    fontPixelHeight: number
    autoCompletion: AutoCompletionInfo
    quickInfo: Oni.Plugin.QuickInfo
    popupMenu: Menu
}

export interface Menu {
    filter: string,
    filteredOptions: Oni.Menu.MenuOption[],
    options: Oni.Menu.MenuOption[],
    selectedIndex: number
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
