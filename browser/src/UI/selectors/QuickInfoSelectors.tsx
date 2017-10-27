import * as os from "os"

import * as React from "react"
import * as types from "vscode-languageserver-types"

import * as UI from "./../../UI"
import * as Colors from "./../Colors"
import { CodeActionHover } from "./../components/CodeActions"
import { ErrorInfo } from "./../components/ErrorInfo"
import { QuickInfoDocumentation, QuickInfoTitle } from "./../components/QuickInfo"
import * as Selectors from "./../Selectors"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

export const renderQuickInfo = (hover: types.Hover, actions: types.Command[], errors: types.Diagnostic[]) => {
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
    const commandElements = getCommandElements(actions, backgroundColor, foregroundColor)

    let derpElement: JSX.Element[] = []

    if (actions.length > 0) {
        derpElement = [<QuickInfoDocumentation text={`${actions.length} refactorings available`} />]
    }
    const elements = [...errorElements, ...quickInfoElements, ...derpElement ]

    return <div className="quickinfo-container enable-mouse">
            <div className="quickinfo">
                <div className="container horizontal center">
                    <div className="container fixed center">
                    {commandElements}
                    </div>
                    <div className="container full">
                    {elements}
                    </div>
                </div>
            </div>
           </div>
}

const getCommandElements = (commands: types.Command[], backgroundColor: string, foregroundColor: string): JSX.Element[] => {

    if(!commands || !commands.length) {
        return Selectors.EmptyArray
    } else {
        return [<CodeActionHover backgroundColor={backgroundColor} foregroundColor={foregroundColor}/>]
    }
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
