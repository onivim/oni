/**
 * LanguageClientStatusBar.tsx
 *
 * Implements status bar for Oni
 */

import * as React from "react"

import { Icon } from "./../../../UI/Icon"

import { Oni } from "./../Oni"

export class LanguageClientStatusBar {

    private _item: Oni.StatusBarItem
    private _fileType: string

    constructor(private _oni: Oni) {
        this._item = this._oni.statusBar.createItem(0, 0)
    }

    public show(fileType: string): void {
        this._fileType = fileType
        this._item.setContents(<StatusBarRenderer state={LanguageClientState.NotAvailable} language={this._fileType} />)
        this._item.show()
    }

    public setStatus(status: LanguageClientState): void {
        this._item.setContents(<StatusBarRenderer state={status} language={this._fileType} />)
    }

    hide(): void {
        this._item.hide()
    }

    // setStatus(): void {

    // }
}

export enum LanguageClientState {
    NotAvailable = 0,
    Initializing,
    Initialized,
    Active,
}

// const SpinnerIcon = "circle-o-notch"
const ConnectedIcon = "bolt"

interface StatusBarRendererProps {
    state: LanguageClientState
    language: string
}

const StatusBarRenderer = (props: StatusBarRendererProps) => {
        const style = {
            height: "100%",
            backgroundColor: "black",
            color: "white"
        }
        return <div style={style}>
            <Icon name={ConnectedIcon} />
            <span>python</span>
            </div>
}
