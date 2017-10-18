import * as React from "react"
import { createSelector } from "reselect"
import * as types from "vscode-languageserver-types"

import * as Colors from "./../Colors"
import { ErrorInfo } from "./../components/ErrorInfo"
import { QuickInfoDocumentation, QuickInfoTitle } from "./../components/QuickInfo"
import * as Selectors from "./../Selectors"
import { IState } from "./../State"

export interface ITextProps {
    text: string
}

export class TextComponent extends React.PureComponent<ITextProps, void> {

}

export class Text extends TextComponent {
    public render(): JSX.Element {
        return <span>{this.props.text}</span>
    }
}

export class SelectedText extends TextComponent {
    public render(): JSX.Element {
        return <span className="selected">{this.props.text}</span>
    }
}

const getQuickInfoRaw = (state: IState) => state.quickInfo

export const getQuickInfo = createSelector(
    [Selectors.getActiveWindow, getQuickInfoRaw],
    (win, quickInfo) => {

    if (!win) {
        return null
    }

    const { file, line, column } = win

    if (!quickInfo) {
        return null
    }

    if (quickInfo.filePath !== file
        || quickInfo.line !== line
        || quickInfo.column !== column) {
            return null
        }

    return quickInfo.data
})

export const getQuickInfoElement = createSelector(
    [getQuickInfo, Selectors.getErrorsForPosition, Selectors.getForegroundBackgroundColor],
    (quickInfo, errors, colors) => {

        if (!quickInfo && !errors) {
            return Selectors.EmptyArray
        } else {

            const quickInfoElements = getQuickInfoElements(quickInfo)

            let customErrorStyle = { }
            if (quickInfoElements.length > 0) {
                const borderColor = Colors.getBorderColor(colors.backgroundColor, colors.foregroundColor)
                customErrorStyle = {
                    "border-bottom": "1px solid " + borderColor,
                }
            }

            const errorElements = getErrorElements(errors, customErrorStyle)
            return errorElements.concat(quickInfoElements)
        }
    })

const getErrorElements = (errors: types.Diagnostic[], style: any): JSX.Element[] => {
    if (!errors || !errors.length) {
        return Selectors.EmptyArray
    } else {
        return [<ErrorInfo errors={errors} style={style} />]
    }

}

const getQuickInfoElements = (quickInfo: Oni.Plugin.QuickInfo): JSX.Element[] => {

    if (!quickInfo || (!quickInfo.title && !quickInfo.description)) {
        return Selectors.EmptyArray
    } else {
        return [
            <QuickInfoTitle text={quickInfo.title} />,
            <QuickInfoDocumentation text={quickInfo.description} />,
        ]
    }

}
