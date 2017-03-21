import * as State from "./State"

import * as Fuse from "fuse.js"

import * as Actions from "./Actions"

import * as _ from "lodash"

export const reducer = (s: State.IState, a: Actions.Action) => {

    if (!s) {
        return s
    }

    switch (a.type) {
        case "SET_CURSOR_POSITION":
            return Object.assign({}, s, {
                cursorPixelX: a.payload.pixelX,
                cursorPixelY: a.payload.pixelY,
                fontPixelWidth: a.payload.fontPixelWidth,
                fontPixelHeight: a.payload.fontPixelHeight,
                cursorCharacter: a.payload.cursorCharacter,
                cursorPixelWidth: a.payload.cursorPixelWidth,
            })
        case "SET_ACTIVE_WINDOW_DIMENSIONS":
            return { ...s, ...{ activeWindowDimensions: a.payload.dimensions } }
        case "SET_MODE":
            return { ...s, ...{ mode: a.payload.mode } }
        case "SET_COLORS":
            return { ...s, ...{ foregroundColor: a.payload.foregroundColor } }
        case "SHOW_QUICK_INFO":
            return Object.assign({}, s, {
                quickInfo: {
                    title: a.payload.title,
                    description: a.payload.description,
                },
            })
        case "HIDE_QUICK_INFO":
            return Object.assign({}, s, {
                quickInfo: null,
            })
        case "SHOW_AUTO_COMPLETION":
            return Object.assign({}, s, {
                autoCompletion: {
                    base: a.payload.base,
                    entries: a.payload.entries,
                    selectedIndex: 0,
                },
            })
        case "HIDE_AUTO_COMPLETION":
            return Object.assign({}, s, {
                autoCompletion: null,
            })
        case "SHOW_SIGNATURE_HELP":
            return Object.assign({}, s, {
                signatureHelp: a.payload,
            })
        case "HIDE_SIGNATURE_HELP":
            return Object.assign({}, s, {
                signatureHelp: null,
            })
         case "HIDE_CURSOR_LINE":
             return Object.assign({}, s, {
                 cursorLineVisible: false,
            })
         case "HIDE_CURSOR_COLUMN":
             return Object.assign({}, s, {
                 cursorColumnVisible: false,
            })
         case "SHOW_CURSOR_LINE":
             return Object.assign({}, s, {
                 cursorLineVisible: true,
            })
         case "SHOW_CURSOR_COLUMN":
             return Object.assign({}, s, {
                 cursorColumnVisible: true,
            })
        case "SET_CURSOR_LINE_OPACITY":
            return Object.assign({}, s, {
                cursorLineOpacity: a.payload.opacity,
            })
        case "SET_CURSOR_COLUMN_OPACITY":
            return Object.assign({}, s, {
                cursorLineOpacity: a.payload.opacity,
            })
        default:
            return Object.assign({}, s, {
                autoCompletion: autoCompletionReducer(s.autoCompletion, a), // FIXME: null
                popupMenu: popupMenuReducer(s.popupMenu, a), // FIXME: null
            })
    }
}

export const popupMenuReducer = (s: State.IMenu | null, a: Actions.Action) => {

    // TODO: sync max display items (10) with value in Menu.render() (Menu.tsx)
    let size = s ? Math.min(10, s.filteredOptions.length) : 0

    switch (a.type) {
        case "SHOW_MENU":
            const sortedOptions = _.sortBy(a.payload.options, (f) => f.pinned ? 0 : 1).map((o) => ({
                icon: o.icon,
                detail: o.detail,
                label: o.label,
                pinned: o.pinned,
                detailHighlights: [],
                labelHighlights: [],
            }))

            return {
                id: a.payload.id,
                filter: "",
                filteredOptions: sortedOptions,
                options: a.payload.options,
                selectedIndex: 0,
            }
        case "HIDE_MENU":
            return null
        case "NEXT_MENU":
            if (!s) {
                return s
            }

            return Object.assign({}, s, {
                selectedIndex: (s.selectedIndex + 1) % size,
            })
        case "PREVIOUS_MENU":
            if (!s) {
                return s
            }

            return Object.assign({}, s, {
                selectedIndex: s.selectedIndex > 0 ? s.selectedIndex - 1 : size - 1,
            })
        case "FILTER_MENU":
            if (!s) {
                return s
            }

            // If we already had search results, and this search is a superset of the previous,
            // just filter the already-pruned subset
            const optionsToSearch = a.payload.filter.indexOf(s.filter) === 0 ? s.filteredOptions : s.options
            const filteredOptionsSorted = filterMenuOptions(optionsToSearch, a.payload.filter)

            return Object.assign({}, s, {
                filter: a.payload.filter,
                filteredOptions: filteredOptionsSorted,
            })
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

        return _.sortBy(opt, (o) => o.pinned ? 0 : 1)
    }

    let fuseOptions = {
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
        const combined = o.label + o.detail

        for (let c of searchSet) {
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

export const autoCompletionReducer = (s: State.IAutoCompletionInfo | null, a: Actions.Action) => {
    if (!s) {
        return s
    }

    // TODO: sync max display items (10) with value in AutoCompletion.render() (AutoCompletion.tsx)
    const currentEntryCount = Math.min(10, s.entries.length)

    switch (a.type) {
        case "NEXT_AUTO_COMPLETION":
            return Object.assign({}, s, {
                selectedIndex: (s.selectedIndex + 1) % currentEntryCount,
            })
        case "PREVIOUS_AUTO_COMPLETION":
            return Object.assign({}, s, {
                selectedIndex: s.selectedIndex > 0 ? s.selectedIndex - 1 : currentEntryCount - 1,
            })
        default:
            return Object.assign({}, s, {
                entries: autoCompletionEntryReducer(s.entries, a),
            })
    }
}

export const autoCompletionEntryReducer = (s: Oni.Plugin.CompletionInfo[], action: Actions.Action) => {
    switch (action.type) {
        case "SET_AUTO_COMPLETION_DETAILS":
            return s.map((entry) => {
                if (action.payload.detailedEntry && entry.label === action.payload.detailedEntry.label) {
                    return action.payload.detailedEntry
                }
                return entry
            })
        default:
            return s
    }
}
