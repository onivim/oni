import * as React from "react"

import { AutoCompletionContainer } from "./components/AutoCompletion"
import { Cursor } from "./components/Cursor"
import { CursorColumn } from "./components/CursorColumn"
import { CursorLine } from "./components/CursorLine"
import { MenuContainer } from "./components/Menu"
import { QuickInfoContainer, SignatureHelpContainer } from "./components/QuickInfo"

export class RootComponent extends React.Component<void, void> {
    public render() {

        return <div className="ui-overlay">
            <Cursor />
            <CursorLine />
            <CursorColumn />
            <QuickInfoContainer />
            <SignatureHelpContainer />
            <MenuContainer />
            <AutoCompletionContainer />
        </div>
    }
}
