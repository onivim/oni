import * as os from "os"

import * as React from "react"
import { createSelector } from "reselect"
import * as types from "vscode-languageserver-types"

import * as Colors from "./../Colors"
import { ErrorInfo } from "./../components/ErrorInfo"
import { QuickInfoDocumentation, QuickInfoTitle } from "./../components/QuickInfo"
import * as Selectors from "./../Selectors"
import { IQuickInfo, IState } from "./../State"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

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

export const getQuickInfo = (state: IState) => state.quickInfo

export const renderQuickInfo = (hover: types.Hover, errors: types.Diagnostic[]) => {
    const quickInfoElements = getQuickInfoElementsFromHover(hover)

    let customErrorStyle = { }
    if (quickInfoElements.length > 0) {
        // TODO:
        const borderColor = Colors.getBorderColor("black", "white")
        customErrorStyle = {
            "border-bottom": "1px solid " + borderColor,
        }
    }

    const errorElements = getErrorElements(errors, customErrorStyle)
    const elements = errorElements.concat(quickInfoElements)

    return <div className="quickinfo-container">
            <div className="quickinfo">
            {elements}
            </div>
           </div>
}


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

const EmptyArray: any[] = []

const getQuickInfoElementsFromHover = (hover: types.Hover): JSX.Element[] => {
    const titleAndContents = getTitleAndContents(hover)

    if (!titleAndContents) {
        return EmptyArray
    }

    return [
        <QuickInfoTitle text={titleAndContents.title} />,
        <QuickInfoDocumentation text={titleAndContents.description} />,
    ]

}

const getQuickInfoElements = (quickInfo: IQuickInfo): JSX.Element[] => {

    if (!quickInfo || (!quickInfo.title && !quickInfo.description)) {
        return Selectors.EmptyArray
    } else {
        return [
            <QuickInfoTitle text={quickInfo.title} />,
            <QuickInfoDocumentation text={quickInfo.description} />,
        ]
    }

}
