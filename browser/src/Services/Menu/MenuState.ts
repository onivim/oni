/**
 * MenuState.ts
 *
 * Definition of State for Menu functionality
 */

export interface IMenus<T, FilteredT> {
    // TOOD: In the future, could handle multiple menus here...
    menu: IMenu<T, FilteredT>
}

export interface IMenu<T, FilteredT> {
    id: string,
    filter: string,
    filteredOptions: FilteredT[],
    options: T[],
    selectedIndex: number
    isLoading: boolean

    backgroundColor: string
    foregroundColor: string
    borderColor: string
    highlightColor: string

    filterFunction: (items: T[], searchString: string) => FilteredT[]

    onFilterTextChanged: (newText: string) => void
    onSelectedItemChanged: (newItem: FilteredT) => void
    onSelectItem: (idx: number) => void
    onHide: () => void
}

export function createDefaultState<T, FilteredT>(): IMenus<T, FilteredT> {
    return {
        menu: null,
    }
}
