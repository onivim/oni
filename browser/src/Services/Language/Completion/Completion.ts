/**
 * Completion.ts
 */

import * as isEqual from "lodash/isEqual"
import "rxjs/add/observable/combineLatest"
import "rxjs/add/operator/withLatestFrom"
import { Observable } from "rxjs/Observable"

import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"

import * as Log from "./../../../Log"
import * as Helpers from "./../../../Plugins/Api/LanguageClient/LanguageClientHelpers"
import { configuration } from "./../../Configuration"

import { ILatestCursorAndBufferInfo } from "./../LanguageEditorIntegration"
import { languageManager } from "./../LanguageManager"

import { createCompletionMenu } from "./CompletionMenu"
import * as CompletionUtility from "./CompletionUtility"

export interface ICompletionMeetInfo {
    language: string
    filePath: string
    meetLine: number
    meetPosition: number
    queryPosition: number
    meetBase: string
    shouldExpand: boolean
}

export interface ICompletionResults {
    completions: types.CompletionItem[]
    meetLine: number
    meetPosition: number
}

export const initCompletionUI = (latestCursorAndBufferInfo$: Observable<ILatestCursorAndBufferInfo>, modeChanged$: Observable<Oni.Vim.Mode>) => {

    // Observable that gets full completion context (cursor positon + meet info)
    const completionMeet$: Observable<ICompletionMeetInfo> = latestCursorAndBufferInfo$
        .map((changeInfo) => {
            const token = languageManager.getTokenRegex(changeInfo.language)
            const completionCharacters = languageManager.getCompletionTriggerCharacters(changeInfo.language)
            const meet = CompletionUtility.getCompletionMeet(changeInfo.contents, changeInfo.cursorColumn, token, completionCharacters)

            if (Log.isDebugLoggingEnabled()) {
                Log.debug(`[COMPLETION] Got meet at position: ${meet.position} with base: ${meet.base} - shouldExpand: ${meet.shouldExpandCompletions}`)
            }

            return {
                language: changeInfo.language,
                filePath: changeInfo.filePath,
                meetLine: changeInfo.cursorLine,
                meetPosition: meet.position,
                queryPosition: meet.positionToQuery,
                meetBase: meet.base,
                shouldExpand: meet.shouldExpandCompletions,
            }
        })

    const completion$: Observable<ICompletionResults> = completionMeet$
        // Only check for completion if the meets have actually changed
        // requesting completions for the same spot
        .distinctUntilChanged(isEqual)
        .filter((info) => info.shouldExpand)
        .mergeMap((completionInfo: ICompletionMeetInfo) => {
            return Observable.defer(async () => {
                const results = await getCompletions(completionInfo.language, completionInfo.filePath, completionInfo.meetLine, completionInfo.queryPosition)

                if (!results || !results.length) {
                    return null
                }

                return {
                    completions: results,
                    meetLine: completionInfo.meetLine,
                    meetPosition: completionInfo.meetPosition,
                }
            })
        })

    // Core completion logic:
    // Take the latest completion info, meet info, and mode
    // and determine what to show in the context menu
    const resolvedCompletion$ = Observable
        .combineLatest(completion$, completionMeet$)
        .map((args: [ICompletionResults, ICompletionMeetInfo]) => {

            const [completionInfo, meetInfo] = args
            return resolveCompletionsFromCurrentState(completionInfo, meetInfo)
        })

    createCompletionMenu(completionMeet$, resolvedCompletion$, modeChanged$)
}

export interface IResolvedCompletions {
    completions: types.CompletionItem[]
    meetInfo: ICompletionMeetInfo
}

export const resolveCompletionsFromCurrentState = (completionInfo: ICompletionResults, meetInfo: ICompletionMeetInfo): IResolvedCompletions  => {
    if (!completionInfo) {
        return null
    }

    const { completions, meetLine, meetPosition } = completionInfo

    const filteredCompletions = filterCompletionOptions(completions, meetInfo.meetBase)

    if (!filteredCompletions || !filteredCompletions.length || !meetInfo.shouldExpand) {
        return null
    } else if (meetLine !== meetInfo.meetLine || meetPosition !== meetInfo.meetPosition) {
        return null
    } else if (filteredCompletions.length === 1) {
        const completionItem: types.CompletionItem = filteredCompletions[0]
        if (CompletionUtility.getInsertText(completionItem) === meetInfo.meetBase) {
            return null
        } else {
            return {
                completions: filteredCompletions,
                meetInfo,
            }
        }
    } else {
        return {
            completions: filteredCompletions,
            meetInfo,
        }
    }
}

export const filterCompletionOptions = (items: types.CompletionItem[], searchText: string): types.CompletionItem[] => {
    if (!searchText) {
        return items
    }

    if (!items || !items.length) {
        return null
    }

    const filterRegEx = new RegExp("^" + searchText.split("").join(".*") + ".*")

    const filteredOptions = items.filter((f) => {
        const textToFilterOn = f.filterText || f.label
        return textToFilterOn.match(filterRegEx)
    })

    return filteredOptions.sort((itemA, itemB) => {

        const itemAFilterText = itemA.filterText || itemA.label
        const itemBFilterText = itemB.filterText || itemB.label

        const indexOfA = itemAFilterText.indexOf((searchText))
        const indexOfB = itemBFilterText.indexOf((searchText))

        return indexOfB - indexOfA
    })
}

export const getCompletions = async (language: string, filePath: string, line: number, character: number): Promise<types.CompletionItem[]> => {

    if (!configuration.getValue("editor.completions.enabled")) {
        return null
    }

    if (Log.isDebugLoggingEnabled()) {
        Log.debug(`[COMPLETION] Requesting completions at line ${line} and character ${character}`)
    }

    const args = {
        textDocument: {
            uri: Helpers.wrapPathInFileUri(filePath),
        },
        position: {
            line,
            character,
        },
    }
    let result = null
    try {
        result = await languageManager.sendLanguageServerRequest(language, filePath, "textDocument/completion", args)
    } catch (ex) {
        Log.verbose(ex)
    }

    if (!result) {
        return null
    }

    const items = getCompletionItems(result)

    if (!items) {
        return null
    }

    if (Log.isDebugLoggingEnabled()) {
        Log.debug(`[COMPLETION] Got completions: ${items}`)
    }

    const completions = items.map((i) => _convertCompletionForContextMenu(i))

    return completions
}

export const resolveCompletionItem = async (language: string, filePath: string, completionItem: types.CompletionItem): Promise<types.CompletionItem> => {
    let result
    try {
        result = await languageManager.sendLanguageServerRequest(language, filePath, "completionItem/resolve", completionItem)
    } catch (ex) {
        Log.verbose(ex)
    }

    if (!result) {
        return null
    }

    return _convertCompletionForContextMenu(result)
}

const getCompletionItems = (items: types.CompletionItem[] | types.CompletionList): types.CompletionItem[] => {
    if (!items) {
        return []
    }

    if (Array.isArray(items)) {
        return items
    } else {
        return items.items || []
    }
}

const getCompletionDocumentation = (item: types.CompletionItem): string | null => {
    if (item.documentation) {
        return item.documentation
    } else if (item.data && item.data.documentation) {
        return item.data.documentation
    } else {
        return null
    }
}

const _convertCompletionForContextMenu = (completion: types.CompletionItem): any => ({
    label: completion.label,
    detail: completion.detail,
    documentation: getCompletionDocumentation(completion),
    icon: CompletionUtility.convertKindToIconName(completion.kind),
    insertText: completion.insertText,
    rawCompletion: completion,
})
