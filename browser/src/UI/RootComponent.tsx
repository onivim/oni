import * as React from "react"

import { connect } from "react-redux"
import { AutoCompletionContainer } from "./components/AutoCompletion"
import { Background } from "./components/Background"
import { Cursor } from "./components/Cursor"
import { CursorLine } from "./components/CursorLine"
import { EditorHost } from "./components/EditorHost"
import { InstallHelp } from "./components/InstallHelp"
import { Logs } from "./components/Logs"
import { MenuContainer } from "./components/Menu"
import { QuickInfoContainer, SignatureHelpContainer } from "./components/QuickInfo"
import * as State from "./State"

import { IEditor } from "./../Editor/Editor"

interface IRootComponentProps {
    editor: IEditor
    showNeovimInstallHelp: boolean
}

export class RootComponentRenderer extends React.Component<IRootComponentProps, void> {
    public render() {

        const installNeovimOverlay = this.props.showNeovimInstallHelp ?
        <div className="layer">
          <InstallHelp />
        </div> : null

        return <div className="container full">
            <div className="layer">
                <Background />
            </div>
            <div className="layer">
                <div className="container full">
                    <EditorHost editor={this.props.editor} />
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
            </div>
            {installNeovimOverlay}
        </div>

    }
}

const mapStateToProps = (state: State.IState, props: Partial<IRootComponentProps>): IRootComponentProps => {
    return {
        showNeovimInstallHelp: state.showNeovimInstallHelp,
        editor: props.editor,
    }
}

export const RootComponent = connect(mapStateToProps)(RootComponentRenderer)
