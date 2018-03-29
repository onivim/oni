import * as React from "react"

import { connect } from "react-redux"

import { remote } from "electron"

import { Icon, IconSize } from "./../Icon"

import * as State from "./../../Editor/NeovimEditor/NeovimEditorStore"
import { enableMouse, styled, testable } from "./common"

const InstallHelpWrapper = styled(testable("div", "install-help"))`
    ${enableMouse};
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;

    background-color: rgb(40, 44, 52);
    color: #c8c8c8;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    & a {
        color: #f0f0f0;
    }
`

const Title = styled.div`
    text-align: center;

    & p {
        font-weight: bold;
    }
`

const Instructions = styled.div`
    margin-bottom: 64px;

    & li {
        margin: 8px;
    }
`

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

        return (
            <InstallHelpWrapper>
                <Title>
                    <Icon name="warning" size={IconSize.FiveX} />
                    <h1>Uh oh! Unable to launch Neovim...</h1>
                    <p>Neovim v0.2.1 is required to run Oni.</p>
                </Title>
                <Instructions>
                    <ul>
                        <li>
                            <span>Install neovim from here: </span>
                            <a href="#" onClick={evt => _onClick(evt)}>
                                Installing Neovim
                            </a>
                        </li>
                        <li>
                            Run `nvim --version` from your command prompt to verify you're good to
                            go!
                        </li>
                        <li>Close and re-open Oni</li>
                    </ul>
                </Instructions>
                <div>
                    If this issue persists, help us by logging an{" "}
                    <a href="#" onClick={evt => _onClickIssue}>
                        issue!
                    </a>
                </div>
            </InstallHelpWrapper>
        )
    }
}

const mapStateFromProps = (state: State.IState): InstallHelpViewProps => ({
    visible: state.neovimError,
})

export const InstallHelp = connect(mapStateFromProps)(InstallHelpView)
