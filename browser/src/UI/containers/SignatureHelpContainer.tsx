import * as React from "react"
import { connect } from "react-redux"

import { QuickInfo, QuickInfoDocumentation, SelectedText, Text } from "./../components/QuickInfo"

import { IState } from "./../State"

const mapStateToSignatureHelpProps = (state: IState) => {

    if (!state.signatureHelp) {
        return {
            wrap: false,
            visible: false,
            x: state.cursorPixelX,
            y: state.cursorPixelY - (state.fontPixelHeight),
            elements: [],
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

        let elements = [<Text text={currentItem.prefix} />]
            .concat(parameters)
            .concat([<Text text={currentItem.suffix} />])

        const selectedIndex = Math.min(currentItem.parameters.length, state.signatureHelp.argumentIndex)
        const selectedArgument = currentItem.parameters[selectedIndex]
        if (selectedArgument && selectedArgument.documentation) {
            elements.push(<QuickInfoDocumentation text={selectedArgument.documentation} />)
        }

        return {
            wrap: false,
            visible: true,
            x: state.cursorPixelX,
            y: state.cursorPixelY - (state.fontPixelHeight),
            elements,
        }
    }
}

export const SignatureHelpContainer = connect(mapStateToSignatureHelpProps)(QuickInfo)
