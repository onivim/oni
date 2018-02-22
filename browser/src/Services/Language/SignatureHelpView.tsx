import * as React from "react"

import * as types from "vscode-languageserver-types"

import { QuickInfoDocumentation, Title } from "./../../UI/components/QuickInfo"
import { SelectedText, Text } from "./../../UI/components/Text"

export class SignatureHelpView extends React.PureComponent<types.SignatureHelp, {}> {
    public render(): JSX.Element {
        return (
            <div className="quickinfo-container">
                <div className="quickinfo">{getElementsFromType(this.props)}</div>
            </div>
        )
    }
}

export const getElementsFromType = (signatureHelp: types.SignatureHelp): JSX.Element[] => {
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

    const titleContents = [
        <Title padding="0.5rem" key={"signatureHelp.title"}>
            {elements}
        </Title>,
    ]

    const selectedIndex = Math.min(currentItem.parameters.length, signatureHelp.activeParameter)
    const selectedArgument = currentItem.parameters[selectedIndex]
    if (selectedArgument && selectedArgument.documentation) {
        titleContents.push(<QuickInfoDocumentation text={selectedArgument.documentation} />)
    }

    return titleContents
}

export const render = (signatureHelp: types.SignatureHelp) => {
    return <SignatureHelpView {...signatureHelp} />
}
