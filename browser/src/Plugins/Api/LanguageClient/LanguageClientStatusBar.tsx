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
}

export enum LanguageClientState {
    NotAvailable = 0,
    Initializing,
    Initialized,
    Active,
}

const SpinnerIcon = "circle-o-notch"
const ConnectedIcon = "bolt"

interface StatusBarRendererProps {
    state: LanguageClientState
    language: string
}

const getIconFromStatus = (status: LanguageClientState) => {
    switch (status) {
        case LanguageClientState.Initializing:
            return SpinnerIcon
        default:
            return ConnectedIcon
    }
}

const StatusBarRenderer = (props: StatusBarRendererProps) => {
        const containerStyle: React.CSSProperties = {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            backgroundColor: "rgb(30, 30, 30)",
            color: "white",
            paddingRight: "8px",
            paddingLeft: "8px"
        }

        const iconStyle: React.CSSProperties = {
            paddingRight: "6px",
            minWidth: "14px",
            textAlign: "center",
        }

        return <div style={containerStyle}>
            <span style={iconStyle}>
                <Icon name={getIconFromStatus(props.state)} className={"rotate-animation"}/>
            </span>
            <span>{props.language}</span>
            </div>
}
