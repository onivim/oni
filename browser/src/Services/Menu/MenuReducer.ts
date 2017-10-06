/**
 * MenuReducer.ts
 *
 * Implements state-change logic for the menu
 */

import { execSync } from "child_process"
import * as path from "path"

import * as Fuse from "fuse.js"
import * as sortBy from "lodash/sortBy"

import * as Log from "./../../Log"

import { configuration } from "./../Configuration"

import * as State from "./MenuState"
import * as Actions from "./MenuActions"

export const reducer = (s: State.IMenus, a: Actions.MenuAction): State.IMenus => {
    return {
        ...s,
        menu: popupMenuReducer(s.menu, a)
    }
}

export function popupMenuReducer(s: State.IMenu | null, a: any): State.IMenu {

    // TODO: sync max display items (10) with value in Menu.render() (Menu.tsx)
    const size = s ? Math.min(10, s.filteredOptions.length) : 0

    switch (a.type) {
        case "SHOW_MENU":
            // const sortedOptions = sortBy(a.payload.options, (f: any) => f.pinned ? 0 : 1).map((o: any) => ({
            //     icon: o.icon,
            //     detail: o.detail,
            //     label: o.label,
            //     pinned: o.pinned,
            //     detailHighlights: [] as any,
            //     labelHighlights: [] as any,
            // }))

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

            const filteredOptions = filterMenuOptions(a.payload.items, s.filter, s.id)

            return {
                ...s,
                options: a.payload.items,
                filteredOptions: filteredOptions,
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
            const filteredOptionsSorted = filterMenuOptions(optionsToSearch, a.payload.filter, s.id)

            return {...s,
                    filter: a.payload.filter,
                    filteredOptions: filteredOptionsSorted}
        default:
            return s
    }
}

export function filterMenuOptions(options: Oni.Menu.MenuOption[], searchString: string, id: string): State.IMenuOptionWithHighlights[] {

    // if filtering files (not tasks) and overriddenCommand defined
    if (id === "quickOpen") {
        const overriddenCommand = configuration.getValue("editor.quickOpen.execCommand")
        if (overriddenCommand) {
            try {
                const files = execSync(overriddenCommand.replace("${search}", searchString), { cwd: process.cwd() }) // tslint:disable-line no-invalid-template-strings
                    .toString("utf8")
                    .split("\n")
                const opt: State.IMenuOptionWithHighlights[]  = files.map((untrimmedFile) => {
                    const f = untrimmedFile.trim()
                    const file = path.basename(f)
                    const folder = path.dirname(f)
                    return {
                        icon: "file-text-o",
                        label: file,
                        detail: folder,
                        pinned: false,
                        detailHighlights: [],
                        labelHighlights: [],
                    }
                })
                return opt
            } catch (e) {
                Log.warn(`'${overriddenCommand}' returned an error: ${e.message}\nUsing default filtering`)
            }
        }
    }

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

