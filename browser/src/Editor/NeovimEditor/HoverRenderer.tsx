/**
 * Hover.tsx
 */

import * as Oni from "oni-api"
import * as os from "os"
import * as React from "react"
import * as types from "vscode-languageserver-types"

import getTokens from "./../../Services/SyntaxHighlighting/TokenGenerator"
import { enableMouse } from "./../../UI/components/common"
import { ErrorInfo } from "./../../UI/components/ErrorInfo"
import { QuickInfoElement, QuickInfoWrapper } from "./../../UI/components/QuickInfo"
import QuickInfoWithTheme from "./../../UI/components/QuickInfoContainer"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

import { Configuration } from "./../../Services/Configuration"
import { convertMarkdown } from "./markdown"

import { IToolTipsProvider } from "./ToolTipsProvider"

const HoverToolTipId = "hover-tool-tip"

const HoverRendererContainer = QuickInfoWrapper.extend`
    ${enableMouse};
`

export class HoverRenderer {
    constructor(
        private _editor: Oni.Editor,
        private _configuration: Configuration,
        private _toolTipsProvider: IToolTipsProvider,
    ) {}

    public async showQuickInfo(
        x: number,
        y: number,
        hover: types.Hover,
        errors: types.Diagnostic[],
    ): Promise<void> {
        const elem = await this._renderQuickInfoElement(hover, errors)

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

    private async _renderQuickInfoElement(
        hover: types.Hover,
        errors: types.Diagnostic[],
    ): Promise<JSX.Element> {
        const titleAndContents = await getTitleAndContents(hover)
        const showDebugScope = this._configuration.getValue(
            "editor.textMateHighlighting.debugScopes",
        )

        const errorsExist = Boolean(errors && errors.length)
        const contentExists = Boolean(errorsExist || titleAndContents || showDebugScope)

        return (
            contentExists && (
                <HoverRendererContainer>
                    <QuickInfoElement>
                        <div className="container horizontal center">
                            <div className="container full">
                                <ErrorElement
                                    isVisible={errorsExist}
                                    errors={errors}
                                    hasQuickInfo={!!titleAndContents}
                                />
                                <QuickInfoWithTheme
                                    isVisible={!!titleAndContents}
                                    titleAndContents={titleAndContents}
                                />
                                {showDebugScope && this._getDebugScopesElement()}
                            </div>
                        </div>
                    </QuickInfoElement>
                </HoverRendererContainer>
            )
        )
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

        const items = scopeInfo.scopes.map((si: string) => <li key={si}>{si}</li>)
        return (
            <div
                className="quick-info-debug-scopes"
                key="quickInfo.debugScopes"
                style={{ margin: "16px" }}
            >
                <div>DEBUG: TextMate Scopes:</div>
                <ul style={{ paddingBlockStart: "20px" }}>{items}</ul>
            </div>
        )
    }
}

const html = (str: string) => ({ __html: str })

interface ErrorElementProps {
    errors: types.Diagnostic[]
    hasQuickInfo: boolean
    isVisible: boolean
}

const ErrorElement = ({ isVisible, errors, hasQuickInfo }: ErrorElementProps) => {
    return (
        isVisible && (
            <ErrorInfo errors={errors} hasQuickInfo={hasQuickInfo} key="quickInfo.errorInfo" />
        )
    )
}

const getTitleAndContents = async (result: types.Hover) => {
    if (!result || !result.contents) {
        return null
    }

    const contents = Helpers.getTextFromContents(result.contents)

    if (!contents.length) {
        return null
    }

    const [{ value: titleContent, language }, ...remaining] = contents

    if (!titleContent) {
        return null
    }

    const remainder = remaining.map(r => r.value)
    const [hasRemainder] = remainder

    if (!hasRemainder) {
        const tokensPerLine = await getTokens({ language, line: titleContent })

        return {
            title: html(convertMarkdown({ markdown: titleContent, tokens: tokensPerLine })),
            description: null,
        }
    } else {
        const descriptionContent = remainder.join(os.EOL)

        const tokensPerLine = await getTokens({ language, line: titleContent })

        return {
            title: html(convertMarkdown({ markdown: titleContent, tokens: tokensPerLine })),
            description: html(
                convertMarkdown({
                    markdown: descriptionContent,
                    type: "documentation",
                }),
            ),
        }
    }
}
