/**
 * CodeActions.tsx
 *
 * Components used for rendering when code actions are available
 */

import * as React from "react"

import { commandManager } from "./../../Services/CommandManager"

import { Icon, IconSize } from "./../Icon"

/**
 * Helper component to render errors in the QuickInfo bubble
 */
export class CodeActionHover extends React.PureComponent<{}, {}> {

    public render(): null | JSX.Element {
        const style: React.CSSProperties = {
            padding: "1em",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
        }

        return <div className="container horizontal"> 
        <div className="container horizontal fixed" style={style} onClick={() => commandManager.executeCommand("language.codeAction.expand")}>
            <Icon name="lightbulb-o" size={IconSize.Large}/>
        </div>
        <div className="container full">
            Refactorings available
        </div>
        </div>
    }
}

export const renderCodeActionHover = () => <CodeActionHover />
