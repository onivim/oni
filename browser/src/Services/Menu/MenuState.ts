/**
 * MenuState.ts
 *
 * Definition of State for Menu functionality
 */

export interface IMenus {
    // TOOD: In the future, could handle multiple menus here...
    menu: IMenu
}

export interface IMenu {
    id: string,
    filter: string,
    filteredOptions: IMenuOptionWithHighlights[],
    options: Oni.Menu.MenuOption[],
    selectedIndex: number
    isLoading: boolean

    backgroundColor: string
    foregroundColor: string

    onSelectItem: (idx: number) => void
}

export interface IMenuOptionWithHighlights extends Oni.Menu.MenuOption {
    labelHighlights: number[][],
    detailHighlights: number[][]
}

export const createDefaultState = (): IMenus => ({
    menu: null,
})
