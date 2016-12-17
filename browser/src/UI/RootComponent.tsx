import * as React from "react"
// import { connect } from "react-redux"

// import * as _ from "lodash"

// import { State, AutoCompletionInfo } from "./State"

// import { Icon } from "./Icon"
import { MenuContainer } from "./components/Menu"
import { QuickInfoContainer, SignatureHelpContainer } from "./components/QuickInfo"
// import { HighlightText } from "./components/HighlightText"
import { AutoCompletionContainer } from "./components/AutoCompletion"
import { Cursor } from "./components/Cursor"

export class RootComponent extends React.Component<void, void> {
    public render() {

        // const children = []

        // if (this.props.autoCompletion)
        //     children.push(<AutoCompletionContainer />)

        // if (this.props.popupMenu)
        //     children.push(<MenuContainer />)

        return <div className="ui-overlay">
            <Cursor />
            <QuickInfoContainer />
            <SignatureHelpContainer />
            <MenuContainer />
            <AutoCompletionContainer />
        </div>
    }
}
