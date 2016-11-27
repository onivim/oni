import * as React from "react"
import { connect } from "react-redux"

import * as _ from "lodash"

import { State, AutoCompletionInfo } from "./State"

import { Icon } from "./Icon"
import { MenuContainer } from "./components/Menu"
import { QuickInfoContainer } from "./components/QuickInfo"
import { HighlightText } from "./components/HighlightText"
import { AutoCompletionContainer } from "./components/AutoCompletionContainer"

class RootComponent extends React.Component<State, void> {
    public render() {

        const children = []

        if (this.props.autoCompletion)
            children.push(<AutoCompletionContainer />)

        if (this.props.popupMenu)
            children.push(<MenuContainer />)

        return <div className="ui-overlay">
            <QuickInfoContainer />
            {children}
        </div>
    }
}
