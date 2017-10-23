import { connect } from "react-redux"

import { IState } from "./../State"

import { IQuickInfoProps, QuickInfo } from "./../components/QuickInfo"
import { EmptyArray } from "./../Selectors"
import * as Selectors from "./../selectors/QuickInfoSelectors"

const mapStateToQuickInfoProps = (state: IState): IQuickInfoProps => {
    const elements = Selectors.getQuickInfoElement(state)

    if (!elements || !elements.length || state.mode !== "normal") {
        return {
            visible: false,
            elements: EmptyArray,
            foregroundColor: state.foregroundColor,
            backgroundColor: state.backgroundColor,
        }
    } else {
        return {
            visible: true,
            elements,
            foregroundColor: state.foregroundColor,
            backgroundColor: state.backgroundColor,
        }
    }
}

export const QuickInfoContainer = connect(mapStateToQuickInfoProps)(QuickInfo)
