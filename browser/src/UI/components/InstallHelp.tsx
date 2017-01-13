import * as React from "react"

import { remote } from "electron"

import { Icon, IconSize } from "./../Icon"

require("./InstallHelp.less") // tslint:disable-line no-var-requires

export const InstallHelp = () => {
    const _onClick = (evt: any) => {
        remote.shell.openExternal("https://github.com/neovim/neovim/wiki/Installing-Neovim")
        evt.preventDefault()
    }

    return <div className="install-help">
        <div className="title">
            <Icon name="warning" size={IconSize.FiveX} />
            <h1>Unable to launch NeoVim</h1>
        </div>
        <div className="instructions">
            <ul>
                <li>
                    <span>Install NeoVim from here:</span>
                    <a href="#" onClick={(evt) => _onClick(evt)}>Installing Neovim</a>
                </li>
                <li>Close and re-open Oni</li>
            </ul>
        </div>
    </div>
}
