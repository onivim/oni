import * as React from "react"

import { connect } from "react-redux"

import { remote } from "electron"

import { Icon, IconSize } from "./../Icon"

import * as State from "./../../Editor/NeovimEditor/NeovimEditorStore"

export interface InstallHelpViewProps {
    visible: boolean
}

export class InstallHelpView extends React.PureComponent<InstallHelpViewProps, {}> {

    public render(): JSX.Element {
        if (!this.props.visible) {
            return null
        }

        const _onClick = (evt: any) => {
            remote.shell.openExternal("https://github.com/neovim/neovim/wiki/Installing-Neovim")
            evt.preventDefault()
        }

        const _onClickIssue = (evt: any) => {
            remote.shell.openExternal("https://github.com/onivim/oni/issues")
            evt.preventDefault()
        }

        return <div className="install-help enable-mouse">
            <div className="title">
                <Icon name="warning" size={IconSize.FiveX} />
                <h1>Uh oh! Unable to launch Neovim...</h1>
                <p>Neovim v0.2.1 is required to run Oni.</p>
            </div>
            <div className="instructions">
                <ul>
                    <li>
                        <span>Install neovim from here: </span>
                        <a href="#" onClick={(evt) => _onClick(evt)}>Installing Neovim</a>
                    </li>
                    <li>Run `nvim --version` from your command prompt to verify you're good to go!</li>
                    <li>Close and re-open Oni</li>
                </ul>
            </div>
            <div>
                If this issue persists, help us by logging an <a href="#" onClick={(evt) => _onClickIssue}>issue!</a>
            </div>
        </div>
    }
}

const mapStateFromProps = (state: State.IState): InstallHelpViewProps => ({
    visible: state.neovimError,
})

export const InstallHelp = connect(mapStateFromProps)(InstallHelpView)
