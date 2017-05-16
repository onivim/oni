import * as React from "react"
import { connect } from "react-redux"

import { QuickInfo, QuickInfoDocumentation, QuickInfoTitle } from "./../components/QuickInfo"
import { IState } from "./../State"

const mapStateToQuickInfoProps = (state: IState) => {
    if (!state.quickInfo) {
        return {
            wrap: true,
            visible: false,
            x: state.cursorPixelX,
            y: state.cursorPixelY - (state.fontPixelHeight),
            elements: [],
        }
    } else {
        return {
            wrap: true,
            visible: true,
            x: state.cursorPixelX,
            y: state.cursorPixelY - (state.fontPixelHeight),
            elements: [
                <QuickInfoTitle text={state.quickInfo.title} />,
                <QuickInfoDocumentation text={state.quickInfo.description} />,
            ],
        }
    }
}

export const QuickInfoContainer = connect(mapStateToQuickInfoProps)(QuickInfo)
