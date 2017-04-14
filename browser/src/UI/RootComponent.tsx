import * as React from "react"

import { connect } from "react-redux"
import { AutoCompletionContainer } from "./components/AutoCompletion"
import { Cursor } from "./components/Cursor"
import { CursorLine } from "./components/CursorLine"
import { InstallHelp } from "./components/InstallHelp"
import { Logs } from "./components/Logs"
import { MenuContainer } from "./components/Menu"
import { QuickInfoContainer, SignatureHelpContainer } from "./components/QuickInfo"
import * as State from "./State"

interface IRootComponentProps {
    showNeovimInstallHelp: boolean
}

export class RootComponentRenderer extends React.Component<IRootComponentProps, void> {
    public render() {

        return this.props.showNeovimInstallHelp ?
        <div className="ui-overlay">
          <InstallHelp />
        </div> :
        <div className="ui-overlay">
            <Cursor />
            <CursorLine lineType={"line"} />
            <CursorLine lineType={"column"} />
            <SignatureHelpContainer />
            <QuickInfoContainer />
            <SignatureHelpContainer />
            <MenuContainer />
            <AutoCompletionContainer />
            <Logs />
        </div>
    }
}

const mapStateToProps = (state: State.IState): IRootComponentProps => {
    return {
        showNeovimInstallHelp: state.showNeovimInstallHelp,
    }
}

export const RootComponent = connect(mapStateToProps)(RootComponentRenderer)
