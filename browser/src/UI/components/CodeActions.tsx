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

        return <div className="container horizontal quickinfo-container"> 
        <div className="container horizontal fixed" style={style} onClick={() => commandManager.executeCommand("language.codeAction.expand")}>
            <Icon name="lightbulb-o" size={IconSize.Large}/>
        </div>
        <div className="container full quickinfo">
            <div className="title">Refactorings available</div>
            <div className="documentation">Press alt-enter to expand</div>
        </div>
        </div>
    }
}

export const renderCodeActionHover = () => <CodeActionHover />
