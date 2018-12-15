import * as React from "react"

import * as types from "vscode-languageserver-types"

import { getDocumentationText } from "../../Plugins/Api/LanguageClient/LanguageClientHelpers"
import {
    QuickInfoDocumentation,
    QuickInfoElement,
    QuickInfoWrapper,
    Title,
} from "./../../UI/components/QuickInfo"
import { SelectedText, Text } from "./../../UI/components/Text"

export const getElementsFromType = (signatureHelp: types.SignatureHelp): JSX.Element => {
    const elements = []

    const currentItem = signatureHelp.signatures[signatureHelp.activeSignature]

    if (!currentItem || !currentItem.label || !currentItem.parameters) {
        return null
    }

    const label = currentItem.label
    const parameters = currentItem.parameters

    let remainingSignatureString = label

    let keyIndex = 0
    for (let i = 0; i < parameters.length; i++) {
        const parameterLabel = parameters[i].label
        const parameterIndex = remainingSignatureString.indexOf(parameterLabel)

        if (parameterIndex === -1) {
            continue
        }

        keyIndex++
        const nonArgumentText = remainingSignatureString.substring(0, parameterIndex)
        elements.push(<Text text={nonArgumentText} key={keyIndex.toString()} />)

        const argumentText = remainingSignatureString.substring(
            parameterIndex,
            parameterIndex + parameterLabel.length,
        )

        keyIndex++
        if (i === signatureHelp.activeParameter) {
            elements.push(<SelectedText text={argumentText} key={keyIndex.toString()} />)
        } else {
            elements.push(<Text text={argumentText} key={keyIndex.toString()} />)
        }

        remainingSignatureString = remainingSignatureString.substring(
            parameterIndex + parameterLabel.length,
            remainingSignatureString.length,
        )
    }

    elements.push(<Text key={remainingSignatureString} text={remainingSignatureString} />)

    const selectedIndex = Math.min(currentItem.parameters.length, signatureHelp.activeParameter)
    const selectedArgument = currentItem.parameters[selectedIndex]

    return (
        <React.Fragment>
            <Title padding="0.5rem" key={"signatureHelp.title"}>
                {elements}
            </Title>
            {!!(selectedArgument && selectedArgument.documentation) && (
                <QuickInfoDocumentation
                    text={getDocumentationText(selectedArgument.documentation)}
                />
            )}
        </React.Fragment>
    )
}

export const SignatureHelpView = (props: types.SignatureHelp) => (
    <QuickInfoWrapper>
        <QuickInfoElement>{getElementsFromType(props)}</QuickInfoElement>
    </QuickInfoWrapper>
)

export const render = (signatureHelp: types.SignatureHelp) => (
    <SignatureHelpView {...signatureHelp} />
)
