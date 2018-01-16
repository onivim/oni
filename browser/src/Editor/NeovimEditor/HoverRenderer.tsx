/**
 * Hover.tsx
 */

import * as Oni from "oni-api"
import * as os from "os"
import * as React from "react"
import * as types from "vscode-languageserver-types"

import { ErrorInfo } from "./../../UI/components/ErrorInfo"
import {
    QuickInfoContainer,
    QuickInfoDocumentation,
    QuickInfoTitle,
} from "./../../UI/components/QuickInfo"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

import { IColors } from "./../../Services/Colors"
import { Configuration } from "./../../Services/Configuration"
import { convertMarkdown } from "./markdown"

import * as Selectors from "./NeovimEditorSelectors"
import { IToolTipsProvider } from "./ToolTipsProvider"

const HoverToolTipId = "hover-tool-tip"

export class HoverRenderer {

    constructor(
        private _colors: IColors,
        private _editor: Oni.Editor,
        private _configuration: Configuration,
        private _toolTipsProvider: IToolTipsProvider,
    ) {
    }

    public showQuickInfo(x: number, y: number, hover: types.Hover, errors: types.Diagnostic[]): void {
        const elem = this._renderQuickInfoElement(hover, errors)

        if (!elem) {
            return
        }

        this._toolTipsProvider.showToolTip(HoverToolTipId, elem, {
            position: { pixelX: x, pixelY: y },
            openDirection: 1,
            padding: "0px",
        })
    }

    public hideQuickInfo(): void {
        this._toolTipsProvider.hideToolTip(HoverToolTipId)
    }

    private _renderQuickInfoElement(hover: types.Hover, errors: types.Diagnostic[]): JSX.Element {
        const quickInfoElement = getQuickInfoElementsFromHover(hover)

        const borderColor = this._colors.getColor("toolTip.border")

        let customErrorStyle = {}
        if (quickInfoElement) {
            // TODO:
            customErrorStyle = {
                "border-bottom": "1px solid " + borderColor,
            }
        }

        const errorElements = getErrorElements(errors, customErrorStyle)

        // Remove falsy values as check below [null] is truthy
        const elements = [...errorElements, quickInfoElement].filter(Boolean)

        if (this._configuration.getValue("experimental.editor.textMateHighlighting.debugScopes")) {
            elements.push(this._getDebugScopesElement())
        }

        if (!elements.length) {
            return null
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

    private _getDebugScopesElement(): JSX.Element {
        const editor: any = this._editor

        if (!editor || !editor.syntaxHighlighter) {
            return null
        }

        const cursor = editor.activeBuffer.cursor
        const scopeInfo = editor.syntaxHighlighter.getHighlightTokenAt(editor.activeBuffer.id, {
            line: cursor.line,
            character: cursor.column,
        })

        if (!scopeInfo || !scopeInfo.scopes) {
            return null
        }
        const items = scopeInfo.scopes.map((si: string) => <li>{si}</li>)
        return <QuickInfoDocumentation>
            <div>DEBUG: TextMate Scopes:</div>
            <ul>
                {items}
            </ul>
        </QuickInfoDocumentation>
    }
}

const getErrorElements = (errors: types.Diagnostic[], style: any): JSX.Element[] => {
    if (!errors || !errors.length) {
        return Selectors.EmptyArray
    } else {
        return [<ErrorInfo errors={errors} style={style} />]
    }
}

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
            title: convertMarkdown(title),
            description: null,
        }
    } else {
        const description = [...contents]
        description.shift()
        const descriptionContent = description.join(os.EOL)

        return {
            title: convertMarkdown(contents[0]),
            description: convertMarkdown(descriptionContent),
        }
    }
}

const getQuickInfoElementsFromHover = (hover: types.Hover): JSX.Element => {
    const titleAndContents = getTitleAndContents(hover)

    return titleAndContents && (
        <QuickInfoContainer>
            <QuickInfoTitle
                padding={titleAndContents.description ?
                    "0.5rem" : null}
                html={titleAndContents.title} />
            {titleAndContents.description && <QuickInfoDocumentation html={titleAndContents.description} />}
        </QuickInfoContainer>
    )
}
