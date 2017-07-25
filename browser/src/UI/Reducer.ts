import { execSync } from "child_process"
import * as path from "path"
import * as State from "./State"

import * as Fuse from "fuse.js"

import * as Config from "./../Config"
import * as Actions from "./Actions"

import * as _ from "lodash"

import * as types from "vscode-languageserver-types"

export function reducer<K extends keyof Config.IConfigValues> (s: State.IState, a: Actions.Action<K>) {

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
        case "SET_MODE":
            return { ...s, ...{ mode: a.payload.mode } }
        case "SET_COLORS":
            return { ...s, ...{
                foregroundColor: a.payload.foregroundColor,
                backgroundColor: a.payload.backgroundColor,
            } }
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
        case "SET_CONFIGURATION_VALUE":
            let obj: Partial<Config.IConfigValues> = {}
            obj[a.payload.key] = a.payload.value
            let newConfig = Object.assign({}, s.configuration, obj)
            return Object.assign({}, s, {
                configuration: newConfig,
            })
        case "TOGGLE_LOG_FOLD":
            return Object.assign({}, s, {
                logs: s.logs.map((n, i) => {
                    return i === a.payload.index ?
                        Object.assign({}, n, {folded: !n.folded}) : n
                }),
            })
        case "CHANGE_LOGS_VISIBILITY":
            return Object.assign({}, s, {
                logsVisible: a.payload.visibility,
            })
        case "MAKE_LOG":
            const newLog = {
                log: a.payload.log,
                folded: true,
            }
            return Object.assign({}, s, {
                logs: _.concat(s.logs, newLog),
            })
        case "SHOW_MESSAGE_DIALOG":
            return {
                ...s,
                activeMessageDialog: a.payload,
            }
        case "HIDE_MESSAGE_DIALOG":
            return {
                ...s,
                activeMessageDialog: null,
            }
        default:
            return Object.assign({}, s, {
                buffers: buffersReducer(s.buffers, a),
                errors: errorsReducer(s.errors, a),
                autoCompletion: autoCompletionReducer(s.autoCompletion, a), // FIXME: null
                popupMenu: popupMenuReducer(s.popupMenu, a), // FIXME: null
                statusBar: statusBarReducer(s.statusBar, a),
                windowState: windowStateReducer(s.windowState, a),
            })
    }
}

export const buffersReducer = (s: State.Buffers, a: Actions.SimpleAction) => {
    switch (a.type) {
        case "SET_BUFFER_STATE":
            return {
                ...s,
                [a.payload.file]: {
                    totalLines: a.payload.totalLines,
                },
            }
        default:
            return s
    }
}

export const errorsReducer = (s: { [file: string]: { [key: string]: types.Diagnostic[] } }, a: Actions.SimpleAction) => {
    switch (a.type) {
        case "SET_ERRORS":

            const currentFile = s[a.payload.file] || null

            return {
                ...s,
                [a.payload.file]: {
                    ...currentFile,
                    [a.payload.key]: [...a.payload.errors],
                },
            }
        default:
            return s
    }
}

export const statusBarReducer = (s: { [key: string]: State.IStatusBarItem }, a: Actions.SimpleAction) => {
    switch (a.type) {
        case "STATUSBAR_SHOW":
            const existingItem = s[a.payload.id] || {}
            const newItem = {
                ...existingItem,
                ...a.payload,
            }

            return {
                ...s,
                [a.payload.id]: newItem,
            }
        case "STATUSBAR_HIDE":
            return {
                ...s,
                [a.payload.id]: null,
            }
        default:
            return s
    }
}

export function popupMenuReducer (s: State.IMenu | null, a: Actions.SimpleAction) {

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
            const filteredOptionsSorted = filterMenuOptions(optionsToSearch, a.payload.filter, s.id)

            return Object.assign({}, s, {
                filter: a.payload.filter,
                filteredOptions: filteredOptionsSorted,
            })
        default:
            return s
    }
}

export function filterMenuOptions(options: Oni.Menu.MenuOption[], searchString: string, id: string): State.IMenuOptionWithHighlights[] {

    // if filtering files (not tasks) and overriddenCommand defined
    if (id === "quickOpen") {
        const config = Config.instance()
        const overriddenCommand = config.getValue("editor.quickOpen.execCommand")
        if (overriddenCommand) {
            try {
                const files = execSync(overriddenCommand.replace("${search}", searchString), { cwd: process.cwd() })
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
                console.warn(`'${overriddenCommand}' returned an error: ${e.message}\nUsing default filtering`)
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

export const windowStateReducer = (s: State.IWindowState, a: Actions.SimpleAction): State.IWindowState => {

    let currentWindow
    switch (a.type) {
        case "SET_WINDOW_STATE":
            currentWindow = s.windows[a.payload.windowId] || null

            return {
                activeWindow: a.payload.windowId,
                windows: {
                    ...s.windows,
                    [a.payload.windowId]: {
                        ...currentWindow,
                        file: a.payload.file,
                        column: a.payload.column,
                        line: a.payload.line,
                        winline: a.payload.winline,
                        wincolumn: a.payload.wincolumn,
                        windowBottomLine: a.payload.windowBottomLine,
                        windowTopLine: a.payload.windowTopLine,
                    },
                },
            }
        case "SET_WINDOW_DIMENSIONS":
            currentWindow = s.windows[a.payload.windowId] || null

            return {
                ...s,
                windows: {
                    ...s.windows,
                    [a.payload.windowId]: {
                        ...currentWindow,
                        dimensions: a.payload.dimensions,
                    },
                },
            }
        case "SET_WINDOW_LINE_MAP":
            currentWindow = s.windows[a.payload.windowId] || null

            return {
                ...s,
                windows: {
                    ...s.windows,
                    [a.payload.windowId]: {
                        ...currentWindow,
                        lineMapping: a.payload.lineMapping,
                    },
                },
            }
        default:
            return s
    }
}

export function autoCompletionReducer (s: State.IAutoCompletionInfo | null, a: Actions.SimpleAction) {
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

export function autoCompletionEntryReducer (s: Oni.Plugin.CompletionInfo[], action: Actions.SimpleAction) {
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
