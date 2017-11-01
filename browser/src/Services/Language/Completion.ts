/**
 * Completion.ts
 */

import * as isEqual from "lodash/isEqual"
import "rxjs/add/observable/combineLatest"
import "rxjs/add/operator/withLatestFrom"
import { Observable } from "rxjs/Observable"

import * as types from "vscode-languageserver-types"

import { configuration } from "./../Configuration"
import { editorManager } from "./../EditorManager"
import { languageManager } from "./LanguageManager"

import * as Log from "./../../Log"
import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

import * as AutoCompletionUtility from "./../AutoCompletionUtility"

import { ILatestCursorAndBufferInfo } from "./LanguageEditorIntegration"

import { contextMenuManager } from "./../ContextMenu"

export const initCompletionUI = (latestCursorAndBufferInfo$: Observable<ILatestCursorAndBufferInfo>, modeChanged$: Observable<Oni.Vim.Mode>) => {

    let lastCompletedMeet: any = null
    let lastSelection: string = null

    const completionContextMenu = contextMenuManager.create()

    // Observable that gets full completion context (cursor positon + meet info)
    const completionMeet$ = latestCursorAndBufferInfo$
        .map((changeInfo) => {
            const token = languageManager.getTokenRegex(changeInfo.language)
            const completionCharacters = languageManager.getCompletionTriggerCharacters(changeInfo.language)
            const meet = AutoCompletionUtility.getCompletionMeet(changeInfo.contents, changeInfo.cursorColumn, token, completionCharacters)

            if (Log.isDebugLoggingEnabled()) {
                Log.debug(`[COMPLETION] Got meet at position: ${meet.position} with base: ${meet.base} - shouldExpand: ${meet.shouldExpandCompletions}`)
            }

            return {
                ...changeInfo,
                meetLine: changeInfo.cursorLine,
                meetPosition: meet.position,
                queryPosition: meet.positionToQuery,
                meetBase: meet.base,
                shouldExpand: meet.shouldExpandCompletions,
            }
        })
        .distinctUntilChanged(isEqual)

    const completion$ = completionMeet$
        // Extract out the parameters that are important for completion
        .map((bufferMeetInfo) => ({
            language: bufferMeetInfo.language,
            filePath: bufferMeetInfo.filePath,
            meetLine: bufferMeetInfo.cursorLine,
            meetPosition: bufferMeetInfo.meetPosition,
            queryPosition: bufferMeetInfo.queryPosition,
            shouldExpand: bufferMeetInfo.shouldExpand,
        }))
        // Only care if they've changed, so we don't keep
        // requesting completions for the same spot
        .distinctUntilChanged(isEqual)
        .filter((info) => info.shouldExpand)
        .do(() => completionContextMenu.hide())
        .mergeMap((completionInfo: any) => {
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

    // Subscribe to some event streams on the context menu
    const completionMenuItemSelected$ = completionContextMenu.onItemSelected.asObservable()
    completionMenuItemSelected$
        .withLatestFrom(completionMeet$)
        .subscribe((args: any[]) => {
            const [completionItem, lastMeet] = args

            if (lastMeet) {
                const insertText = completionItem.insertText || completionItem.label
                commitCompletion(lastMeet.meetLine, lastMeet.contents, lastMeet.meetPosition, lastMeet.cursorColumn, insertText)
                lastCompletedMeet = lastMeet
                lastSelection = insertText
                completionContextMenu.hide()
            }
        })

    const completionMenuSelectedItemChanged$ = completionContextMenu.onSelectedItemChanged.asObservable()
    completionMenuSelectedItemChanged$
        .withLatestFrom(completionMeet$)
        .subscribe(async (args: any[]) => {
            const [newItem, lastMeet] = args

            const result = await resolveCompletionItem(lastMeet.language, lastMeet.filePath, newItem.rawCompletion)
            completionContextMenu.updateItem(result)
        })

    // Core completion logic:
    // Take the latest completion info, meet info, and mode
    // and determine what to show in the context menu
    Observable
        .combineLatest(completion$, completionMeet$, modeChanged$)
        .subscribe((args: any[]) => {

            const [completionInfo, meetInfo, mode] = args

            if (!completionInfo) {
                return
            }

            if (mode !== "insert") {
                lastCompletedMeet = null
                lastSelection = null
                completionContextMenu.hide()
                return
            }

            if (lastCompletedMeet !== null
                && lastCompletedMeet.meetLine === meetInfo.meetLine
                && lastCompletedMeet.meetPosition === meetInfo.meetPosition
                && lastSelection === meetInfo.meetBase) {
                    completionContextMenu.hide()
                    return
                }

            const { completions, meetLine, meetPosition } = completionInfo

            const filteredCompletions = filterCompletionOptions(completions, meetInfo.meetBase)

            if (!filteredCompletions || !filteredCompletions.length || !meetInfo.shouldExpand) {
                completionContextMenu.hide()
            } else if (filteredCompletions.length === 1) {
                const completionItem: types.CompletionItem = filteredCompletions[0]
                if (completionItem.insertText === meetInfo.meetBase) {
                    completionContextMenu.hide()
                } else {
                    completionContextMenu.show(filteredCompletions, meetInfo.meetBase)
                }
            } else if (meetLine !== meetInfo.meetLine || meetPosition !== meetInfo.meetPosition) {
                completionContextMenu.hide()
            } else {
                completionContextMenu.show(filteredCompletions, meetInfo.meetBase)
            }
        })

    // currentCompletionMeet$.subscribe((newMeet) => { lastMeet = newMeet })
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
        return null
    }

    return _convertCompletionForContextMenu(result)
}

export const commitCompletion = async (line: number, originalLine: string, base: number, column: number, completion: string) => {

    const buffer = editorManager.activeEditor.activeBuffer

    const newLine = AutoCompletionUtility.replacePrefixWithCompletion(originalLine, base, column, completion)

    await buffer.setLines(line, line + 1, [newLine])

    const cursorOffset = newLine.length - originalLine.length

    await buffer.setCursorPosition(line, column + cursorOffset)
}

const convertKindToIconName = (completionKind: types.CompletionItemKind) => {

    switch (completionKind) {
        case types.CompletionItemKind.Class:
            return "cube"
        case types.CompletionItemKind.Color:
            return "paint-brush"
        case types.CompletionItemKind.Constructor:
            return "building"
        case types.CompletionItemKind.Enum:
            return "sitemap"
        case types.CompletionItemKind.Field:
            return "var"
        case types.CompletionItemKind.File:
            return "file"
        case types.CompletionItemKind.Function:
            return "cog"
        case types.CompletionItemKind.Interface:
            return "plug"
        case types.CompletionItemKind.Keyword:
            return "key"
        case types.CompletionItemKind.Method:
            return "flash"
        case types.CompletionItemKind.Module:
            return "cubes"
        case types.CompletionItemKind.Property:
            return "wrench"
        case types.CompletionItemKind.Reference:
            return "chain"
        case types.CompletionItemKind.Snippet:
            return "align-justify"
        case types.CompletionItemKind.Text:
            return "align-justify"
        case types.CompletionItemKind.Unit:
            return "tag"
        case types.CompletionItemKind.Value:
            return "lock"
        case types.CompletionItemKind.Variable:
            return "code"
        default:
            return "question"
    }
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
    icon: convertKindToIconName(completion.kind),
    insertText: completion.insertText,
    rawCompletion: completion,
})
