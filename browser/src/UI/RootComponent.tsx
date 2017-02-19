import * as React from "react"

import { AutoCompletionContainer } from "./components/AutoCompletion"
import { Cursor } from "./components/Cursor"
import { CursorLine } from "./components/CursorLine"
import { MenuContainer } from "./components/Menu"
import { QuickInfoContainer, SignatureHelpContainer } from "./components/QuickInfo"

export class RootComponent extends React.Component<void, void> {
    public render() {

        return <div className="ui-overlay">
            <Cursor />
            <CursorLine lineType={"line"} />
            <CursorLine lineType={"column"} />
            <SignatureHelpContainer />
            <QuickInfoContainer />
            <SignatureHelpContainer />
            <MenuContainer />
            <AutoCompletionContainer />
        </div>
    }
}
