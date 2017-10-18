import * as React from "react"
import { connect } from "react-redux"

import { IState } from "./../State"

import { EmptyArray } from "./../Selectors"

import { IQuickInfoProps, QuickInfo, QuickInfoDocumentation } from "./../components/QuickInfo"
import { SelectedText, Text } from "./../components/Text"

const mapStateToSignatureHelpProps = (state: IState): IQuickInfoProps => {
    if (!state.signatureHelp) {
        return {
            visible: false,
            elements: EmptyArray,
            foregroundColor: state.foregroundColor,
            backgroundColor: state.backgroundColor,
        }
    } else {
        const currentItem = state.signatureHelp.items[state.signatureHelp.selectedItemIndex]

        const parameters = currentItem.parameters.map((item, idx) => {
            // check state.signatureHelp to avoid "Object is possibly 'null'" error
            // even though we already checked it in the 'if' statement above
            if (state.signatureHelp && idx === state.signatureHelp.argumentIndex) {
                return <SelectedText text={item.text} />
            } else {
                return <Text text={item.text} />
            }
        })

        // insert ", " separator in between each parameter
        for (let i = currentItem.parameters.length - 1; i > 0; i -= 1) {
          parameters.splice(i, 0, <Text text={currentItem.separator + " "} />)
        }

        const titleContents = [<Text text={currentItem.prefix} />]
            .concat(parameters)
            .concat([<Text text={currentItem.suffix} />])

        const elements = [<div className="title">{titleContents}</div>]

        const selectedIndex = Math.min(currentItem.parameters.length, state.signatureHelp.argumentIndex)
        const selectedArgument = currentItem.parameters[selectedIndex]
        if (selectedArgument && selectedArgument.documentation) {
            elements.push(<QuickInfoDocumentation text={selectedArgument.documentation} />)
        }

        return {
            visible: true,
            elements,
            foregroundColor: state.foregroundColor,
            backgroundColor: state.backgroundColor,
        }
    }
}

export const SignatureHelpContainer = connect(mapStateToSignatureHelpProps)(QuickInfo)
