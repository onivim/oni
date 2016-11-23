
import * as State from "./State"

import * as Actions from "./Actions"

import * as _ from "lodash"

export const reducer = (s: State.State, a: Actions.Action) => { 

    switch(a.type) {
        case "SET_CURSOR_POSITION":
            return Object.assign({}, s, {
                cursorPixelX: a.payload.pixelX,
                cursorPixelY: a.payload.pixelY,
                fontPixelWidth: a.payload.fontPixelWidth,
                fontPixelHeight: a.payload.fontPixelHeight,
                quickInfo: null
            })
        case "SHOW_QUICK_INFO":
            return Object.assign({}, s, {
                quickInfo: {
                    title: a.payload.title,
                    description: a.payload.description
                }
            })
        case "HIDE_QUICK_INFO":
            return Object.assign({}, s, {
                quickInfo: null
            })
        case "SHOW_AUTO_COMPLETION":
            return Object.assign({}, s, {
                autoCompletion: {
                    base: a.payload.base,
                    entries: a.payload.entries,
                    selectedIndex: 0
                }
            })
        case "HIDE_AUTO_COMPLETION":
            return Object.assign({}, s, {
                autoCompletion: null
            })
    }

    return Object.assign({}, s, {
        autoCompletion: autoCompletionReducer(s.autoCompletion, a),
        popupMenu: popupMenuReducer(s.popupMenu, a)
    });
}

export const popupMenuReducer = (s: State.Menu, a: Actions.Action) => {
    switch(a.type) {
        case "SHOW_MENU":
            const sortedOptions = _.sortBy(a.payload.options, f => f.pinned ? 0 : 1).map(s => ({
                icon: s.icon,
                detail: s.detail,
                label: s.label,
                pinned: s.pinned,
                detailHighlights: [],
                labelHighlights: []
            }))

            return <State.Menu>{
                    filter: "",
                    filteredOptions: sortedOptions,
                    options: a.payload.options,
                    selectedIndex: 0
                }

        case "HIDE_MENU":
            return null
        case "NEXT_MENU": 
            return Object.assign({}, s, {
                selectedIndex: (s.selectedIndex + 1) % s.filteredOptions.length
        })
        case "PREVIOUS_MENU":
            return Object.assign({}, s, {
                selectedIndex: (s.selectedIndex - 1) % s.filteredOptions.length

        })
        case "FILTER_MENU":

            // If we already had search results, and this search is a superset of the previous,
            // just filter the already-pruned subset
            const optionsToSearch = a.payload.filter.indexOf(s.filter) === 0 ? s.filteredOptions : s.options
            const filteredOptionsSorted = filterMenuOptions(optionsToSearch, a.payload.filter)

            return Object.assign({}, s, {
                filter: a.payload.filter,
                filteredOptions: filteredOptionsSorted
            })

    }

    return s
}

export function filterMenuOptions(options: Oni.Menu.MenuOption[], searchString: string): State.MenuOptionWithHighlights[] {

    if (!searchString) {
        const opt =  options.map(o => {
            return {
                label: o.label,
                detail: o.detail,
                icon: o.icon,
                pinned: o.pinned,
                detailHighlights: [],
                labelHighlights: []
            }
        })

        return _.sortBy(opt, o => o.pinned ? 0 : 1)
    }

    const searchArray = searchString.split("")

    let initialFilter = options
    searchArray.forEach((str) => {
        initialFilter = initialFilter.filter(f => f.detail.indexOf(str) >= 0 || f.label.indexOf(str) >= 0)
    })

    const highlightOptions = initialFilter.map(f => {
        const detailArray = f.detail.split("")
        const labelArray = f.label.split("")
        const detailMatches = fuzzyMatchCharacters(detailArray, searchArray)
        const labelMatches = fuzzyMatchCharacters(labelArray, detailMatches.remainingCharacters)

        return {
            icon: f.icon,
            pinned: f.pinned,
            label: f.label,
            detail: f.detail,
            detailArray: detailArray,
            labelArray: labelArray,
            detailMatches: detailMatches,
            labelMatches: labelMatches,
            detailHighlights: detailMatches.highlightIndices,
            labelHighlights: labelMatches.highlightIndices
        }
    })

    const filteredOptions = highlightOptions.filter(f => f.labelMatches.remainingCharacters.length === 0)

    const filteredOptionsSorted = _.sortBy(filteredOptions, (f) => {
        const baseVal = f.pinned ? 0 : 2

        const totalSearchSize = searchArray.length
        const matchingInLabel = fuzzyMatchCharacters(f.labelArray, searchArray)

        const labelMatchPercent = matchingInLabel.highlightIndices.length / totalSearchSize

        return baseVal - labelMatchPercent
    })

    return <any>filteredOptionsSorted
}

export interface FuzzyMatchResults {
    highlightIndices: number[]
    remainingCharacters: string[]
}

export function fuzzyMatchCharacters(text: string[], searchString: string[]): FuzzyMatchResults {
    const startValue = {
        highlightIndices: [],
        remainingCharacters: searchString
    }

    const outputValue = text.reduce((previousValue: FuzzyMatchResults, currValue: string, idx: number) => {

        const { highlightIndices, remainingCharacters } = previousValue

        if (remainingCharacters.length === 0)
            return previousValue

        if(remainingCharacters[0] === currValue) {
            return {
                highlightIndices: highlightIndices.concat([idx]),
                remainingCharacters: remainingCharacters.slice(1, remainingCharacters.length)
            }
        }

        return previousValue
        
    }, startValue)

    return outputValue
}

export const autoCompletionReducer = (s: State.AutoCompletionInfo, a: Actions.Action) => {

    if (!s)
        return s

    const currentEntryCount = s.entries.length;

    switch(a.type) {
        case "NEXT_AUTO_COMPLETION":
            return Object.assign({}, s, {
                selectedIndex: (s.selectedIndex + 1) % currentEntryCount
            })
        case "PREVIOUS_AUTO_COMPLETION":
            return Object.assign({}, s, {
                selectedIndex: (s.selectedIndex - 1) % currentEntryCount
            })
    }

    return Object.assign({}, s, {
        entries: autoCompletionEntryReducer(s.entries, a)
    })
}

export const autoCompletionEntryReducer = (s: Oni.Plugin.CompletionInfo[], action: Actions.Action) => {

    switch(action.type) {
        case "SET_AUTO_COMPLETION_DETAILS":
            return s.map(entry => {

            if(entry.label === action.payload.detailedEntry.label) {
                return action.payload.detailedEntry
            }

            return entry
        })
    }

    return s
}
