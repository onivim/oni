/**
 * CodeActions.tsx
 *
 * Components used for rendering when code actions are available
 */

import * as React from "react"

import { commandManager } from "./../../Services/CommandManager"

import { Icon, IconSize } from "./../Icon"

export interface ICodeActionProps {
    foregroundColor: string
    backgroundColor: string
}

/**
 * Helper component to render errors in the QuickInfo bubble
 */
export class CodeActionHover extends React.PureComponent<ICodeActionProps, void> {

    public render(): null | JSX.Element {
        const style: React.CSSProperties = {
            padding: "1em",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: this.props.backgroundColor,
            color: this.props.foregroundColor,
            cursor: "pointer",
        }
        return <div className="container horizontal" style={style} onClick={() => commandManager.executeCommand("language.codeAction.expand")}>
            <Icon name="lightbulb-o" size={IconSize.Large}/>
        </div>
    }
}
