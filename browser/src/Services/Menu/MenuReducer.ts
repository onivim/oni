/**
 * MenuReducer.ts
 *
 * Implements state-change logic for the menu
 */

import * as Fuse from "fuse.js"
import * as sortBy from "lodash/sortBy"

import * as Actions from "./MenuActions"
import * as State from "./MenuState"

export const reducer = (s: State.IMenus, a: Actions.MenuAction): State.IMenus => {
    return {
        ...s,
        menu: popupMenuReducer(s.menu, a),
    }
}

export function popupMenuReducer(s: State.IMenu | null, a: any): State.IMenu {

    // TODO: sync max display items (10) with value in Menu.render() (Menu.tsx)
    const size = s ? Math.min(10, s.filteredOptions.length) : 0

    switch (a.type) {
        case "SHOW_MENU":
            return {
                ...a.payload.options,
                id: a.payload.id,
                filter: "",
                filteredOptions: [],
                options: [],
                selectedIndex: 0,
                isLoading: false,
            }
        case "SET_MENU_ITEMS":
            if (!s || s.id !== a.payload.id) {
                return s
            }

            const filteredOptions = filterMenuOptions(a.payload.items, s.filter)

            return {
                ...s,
                options: a.payload.items,
                filteredOptions,
            }
        case "SET_MENU_LOADING":
            if (!s || s.id !== a.payload.id) {
                return s
            }

            return {
                ...s,
                isLoading: a.payload.isLoading,
            }
        case "HIDE_MENU":
            return null
        case "NEXT_MENU":
            return {...s,
                    selectedIndex: (s.selectedIndex + 1) % size}
        case "PREVIOUS_MENU":
            return {...s,
                    selectedIndex: s.selectedIndex > 0 ? s.selectedIndex - 1 : size - 1}
        case "FILTER_MENU":
            if (!s) {
                return s
            }
            // If we already had search results, and this search is a superset of the previous,
            // just filter the already-pruned subset
            const optionsToSearch = a.payload.filter.indexOf(s.filter) === 0 ? s.filteredOptions : s.options
            const filteredOptionsSorted = filterMenuOptions(optionsToSearch, a.payload.filter)

            return {...s,
                    filter: a.payload.filter,
                    filteredOptions: filteredOptionsSorted}
        default:
            return s
    }
}

export function filterMenuOptions(options: Oni.Menu.MenuOption[], searchString: string): State.IMenuOptionWithHighlights[] {

    if (!searchString) {
        const opt = options.map((o) => {
            return {
                label: o.label,
                detail: o.detail,
                icon: o.icon,
                pinned: o.pinned,
                detailHighlights: [],
                labelHighlights: [],
            }
        })

        return sortBy(opt, (o) => o.pinned ? 0 : 1)
    }

    const fuseOptions = {
        keys: [{
            name: "label",
            weight: 0.6,
        }, {
            name: "detail",
            weight: 0.4,
        }],
        include: ["matches"],
    }

    // remove duplicate characters
    const searchSet = new Set(searchString)

    // remove any items that don't have all the characters from searchString
    const filteredOptions = options.filter((o) => {

        if (!o.label && !o.detail) {
            return false
        }

        const combined = o.label + o.detail

        for (const c of searchSet) {
            if (combined.indexOf(c) === -1) {
                return false
            }
        }

        return true
    })

    const fuse = new Fuse(filteredOptions, fuseOptions)
    const results = fuse.search(searchString)

    const highlightOptions = results.map((f: any) => {
        let labelHighlights: number[][] = []
        let detailHighlights: number[][] = []
        // matches will have 1 or 2 items depending on
        // whether one or both (label and detail) matched
        f.matches.forEach((obj: any) => {
            if (obj.key === "label") {
                labelHighlights = obj.indices
            } else {
                detailHighlights = obj.indices
            }
        })

        return {
            icon: f.item.icon,
            pinned: f.item.pinned,
            label: f.item.label,
            detail: f.item.detail,
            labelHighlights,
            detailHighlights,
        }
    })

    return highlightOptions
}
