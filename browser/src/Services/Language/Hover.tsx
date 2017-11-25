/**
 * Hover.tsx
 */

import * as os from "os"

import * as React from "react"

import { Observable } from "rxjs/Observable"

import "rxjs/add/operator/combineLatest"

import * as isEqual from "lodash/isEqual"

import * as types from "vscode-languageserver-types"

import { getQuickInfo } from "./QuickInfo"

import { ErrorInfo } from "./../../UI/components/ErrorInfo"
import { QuickInfoDocumentation, QuickInfoTitle } from "./../../UI/components/QuickInfo"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

import * as UI from "./../../UI"
import * as Colors from "./../../UI/Colors"
import * as Selectors from "./../../UI/Selectors"
import * as Utility from "./../../Utility"

import { IResultWithPosition } from "./LanguageClientTypes"

import { configuration } from "./../Configuration"
import { editorManager } from "./../EditorManager"

export const initHoverUI = (shouldHide$: Observable<void>, shouldUpdate$: Observable<void>) => {

    const hoverToolTipId = "hover-tool-tip"

    shouldUpdate$.subscribe(() => UI.Actions.hideToolTip(hoverToolTipId))
    shouldHide$.subscribe(() => UI.Actions.hideToolTip(hoverToolTipId))

    const shouldUpdateQuickInfo$ = shouldUpdate$
        .debounceTime(configuration.getValue("editor.quickInfo.delay"))

    const quickInfoResults$ = Utility.ignoreWhilePendingPromise(shouldUpdateQuickInfo$, () => getQuickInfo())

    const errors$ = UI.state$
        .filter((state) => state.mode === "normal")
        .map((state) => Selectors.getErrorsForPosition(state))
        .distinctUntilChanged(isEqual)

    quickInfoResults$
            .withLatestFrom(quickInfoResults$, errors$)
            .subscribe((args: [any, IResultWithPosition<types.Hover>, types.Diagnostic[]]) => {
                const [, result, errors] = args

                const activeCursor = editorManager.activeEditor.activeBuffer.cursor

                let hover = null

                if (result && (result.position.line === activeCursor.line && result.position.character === activeCursor.column)) {
                    hover = result.result
                }

                if (hover || (errors && errors.length)) {
                    const state: any = UI.store.getState()
                    const elem = renderQuickInfo(hover, errors)
                    UI.Actions.showToolTip(hoverToolTipId, elem, {
                        position: { pixelX: state.cursorPixelX, pixelY: state.cursorPixelY },
                        openDirection: 1,
                        padding: "0px",
                    })
                } else {
                    UI.Actions.hideToolTip(hoverToolTipId)
                }
            })
}

export const renderQuickInfo = (hover: types.Hover, errors: types.Diagnostic[]) => {
    const quickInfoElements = getQuickInfoElementsFromHover(hover)

    const state: any = UI.store.getState()
    const { backgroundColor, foregroundColor } = state
    const borderColor = Colors.getBorderColor(backgroundColor, foregroundColor)

    let customErrorStyle = { }
    if (quickInfoElements.length > 0) {
        // TODO:
        customErrorStyle = {
            "border-bottom": "1px solid " + borderColor,
        }
    }

    const errorElements = getErrorElements(errors, customErrorStyle)

    const elements = [...errorElements, ...quickInfoElements ]

    if (configuration.getValue("experimental.editor.textMateHighlighting.debugScopes")) {
        elements.push(getDebugScopesElement())
    }

    return <div className="quickinfo-container enable-mouse">
            <div className="quickinfo">
                <div className="container horizontal center">
                    <div className="container full">
                    {elements}
                    </div>
                </div>
            </div>
           </div>
}

const getDebugScopesElement = (): JSX.Element => {
    const editor: any = editorManager.activeEditor

    if (!editor || !editor.syntaxHighlighter) {
        return null
    }

    const cursor = editorManager.activeEditor.activeBuffer.cursor
    const scopeInfo = editor.syntaxHighlighter.getHighlightTokenAt(editorManager.activeEditor.activeBuffer.id, {
        line: cursor.line,
        character: cursor.column,
    })

    if (!scopeInfo || !scopeInfo.scopes) {
        return null
    }
    const items = scopeInfo.scopes.map((si: string) => <li>{si}</li>)
    return <div className="documentation">
            <div>DEBUG: TextMate Scopes:</div>
            <ul>
                {items}
            </ul>
        </div>
}

const getErrorElements = (errors: types.Diagnostic[], style: any): JSX.Element[] => {
    if (!errors || !errors.length) {
        return Selectors.EmptyArray
    } else {
        return [<ErrorInfo errors={errors} style={style} />]
    }

}
//
const getTitleAndContents = (result: types.Hover) => {
    if (!result || !result.contents) {
        return null
    }

    const contents = Helpers.getTextFromContents(result.contents)

    if (contents.length === 0) {
        return null
    } else if (contents.length === 1 && contents[0]) {
        const title = contents[0].trim()

        if (!title) {
            return null
        }

        return {
            title,
            description: "",
        }
    } else {

        const description = [...contents]
        description.shift()
        const descriptionContent = description.join(os.EOL)

        return {
            title: contents[0],
            description: descriptionContent,
        }
    }
}

const getQuickInfoElementsFromHover = (hover: types.Hover): JSX.Element[] => {
    const titleAndContents = getTitleAndContents(hover)

    if (!titleAndContents) {
        return Selectors.EmptyArray
    }

    return [
        <QuickInfoTitle text={titleAndContents.title} />,
        <QuickInfoDocumentation text={titleAndContents.description} />,
    ]
}
