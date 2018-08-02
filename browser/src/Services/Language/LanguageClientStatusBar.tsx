/**
 * LanguageClientStatusBar.tsx
 *
 * Implements status bar for Oni
 */

import * as electron from "electron"
import * as React from "react"

import * as Oni from "oni-api"

import { Icon } from "./../../UI/Icon"

export class LanguageClientStatusBar {
    private _item: Oni.StatusBarItem
    private _fileType: string

    constructor(private _oni: Oni.Plugin.Api) {
        this._item = this._oni.statusBar.createItem(0, "oni.status.fileType")
    }

    public show(fileType: string): void {
        this._fileType = fileType
        this._item.setContents(
            <StatusBarRenderer
                state={LanguageClientState.NotAvailable}
                language={this._fileType}
            />,
        )
        this._item.show()
    }

    public setStatus(status: LanguageClientState): void {
        this._item.setContents(<StatusBarRenderer state={status} language={this._fileType} />)
    }

    public hide(): void {
        this._item.hide()
    }
}

export enum LanguageClientState {
    NotAvailable = 0,
    Initializing,
    Initialized,
    Active,
    Error,
}

const SpinnerIcon = "circle-o-notch"
const ConnectedIcon = "bolt"
const ErrorIcon = "exclamation-circle"

interface StatusBarRendererProps {
    state: LanguageClientState
    language: string
}

const getIconFromStatus = (status: LanguageClientState) => {
    switch (status) {
        case LanguageClientState.NotAvailable:
            return null
        case LanguageClientState.Initializing:
            return SpinnerIcon
        case LanguageClientState.Error:
            return ErrorIcon
        default:
            return ConnectedIcon
    }
}

const getClassNameFromstatus = (status: LanguageClientState) => {
    switch (status) {
        case LanguageClientState.Initializing:
            return "rotate-animation"
        default:
            return ""
    }
}

const StatusBarRenderer = (props: StatusBarRendererProps) => {
    const containerStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        backgroundColor: "rgb(35, 35, 35)",
        color: "rgb(200, 200, 200)",
        paddingRight: "8px",
        paddingLeft: "8px",
    }

    const iconStyle: React.CSSProperties = {
        paddingRight: "6px",
        minWidth: "14px",
        textAlign: "center",
    }

    const openDevTools = () => {
        electron.remote.getCurrentWindow().webContents.openDevTools()
    }

    const onClick = props.state === LanguageClientState.Error ? openDevTools : null

    const iconName = getIconFromStatus(props.state)

    const icon = iconName ? (
        <span style={iconStyle}>
            <Icon name={iconName} className={getClassNameFromstatus(props.state)} />
        </span>
    ) : null

    return (
        <div style={containerStyle} onClick={onClick}>
            {icon}
            <span>{props.language}</span>
        </div>
    )
}
