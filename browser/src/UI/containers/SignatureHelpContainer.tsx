import * as React from "react"
import { connect } from "react-redux"

import { IState } from "./../State"

import { EmptyArray } from "./../Selectors"

import { IQuickInfoProps, QuickInfo, QuickInfoDocumentation } from "./../components/QuickInfo"
import { SelectedText, Text } from "./../components/Text"

import { getSignatureHelp } from "./../selectors/SignatureHelpSelectors"

const emptyProps = {
    visible: false,
    elements: EmptyArray,
    foregroundColor: "",
    backgroundColor: "",
}

const mapStateToSignatureHelpProps = (state: IState): IQuickInfoProps => {
    const signatureHelp = getSignatureHelp(state)
    if (!signatureHelp) {
        return emptyProps
    } else {
        const currentItem = signatureHelp.signatures[signatureHelp.activeSignature]

        if (!currentItem || !currentItem.label || !currentItem.parameters) {
            return emptyProps
        }

        const elements = []

        const label = currentItem.label
        const parameters = currentItem.parameters

        let remainingSignatureString = label

        for (let i = 0; i < parameters.length; i++) {
            const parameterLabel = parameters[i].label
            const parameterIndex = remainingSignatureString.indexOf(parameterLabel)

            if (parameterIndex === -1) {
                continue
            }

            const nonArgumentText = remainingSignatureString.substring(0, parameterIndex)
            elements.push(<Text text={nonArgumentText} />)

            const argumentText = remainingSignatureString.substring(parameterIndex, parameterIndex + parameterLabel.length)

            if (i === signatureHelp.activeParameter) {
                elements.push(<SelectedText text={argumentText} />)
            } else {
                elements.push(<Text text={argumentText} />)
            }

            remainingSignatureString = remainingSignatureString.substring(parameterIndex + parameterLabel.length, remainingSignatureString.length)
        }

        elements.push(<Text text={remainingSignatureString} />)

        const titleContents = [<div className="title">{elements}</div>]

        const selectedIndex = Math.min(currentItem.parameters.length, signatureHelp.activeParameter)
        const selectedArgument = currentItem.parameters[selectedIndex]
        if (selectedArgument && selectedArgument.documentation) {
            titleContents.push(<QuickInfoDocumentation text={selectedArgument.documentation} />)
        }

        return {
            visible: true,
            elements: titleContents,
            foregroundColor: state.foregroundColor,
            backgroundColor: state.backgroundColor,
        }
    }
}

export const SignatureHelpContainer = connect(mapStateToSignatureHelpProps)(QuickInfo)
