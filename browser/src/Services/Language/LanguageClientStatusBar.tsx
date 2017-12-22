/**
 * LanguageClientStatusBar.tsx
 *
 * Implements status bar for Oni
 */

import * as electron from "electron"
import * as React from "react"

import * as Oni from "oni-api"

import styled from "styled-components"

import { Icon } from "./../../UI/Icon"

import { statusBar } from "./../StatusBar"

export class LanguageClientStatusBar {

    private _item: Oni.StatusBarItem
    private _fileType: string

    constructor() {
        this._item = statusBar.createItem(0, "oni.status.filetype")
    }

    public show(fileType: string): void {
        this._fileType = fileType
        this._item.setContents(<StatusBarRenderer state={LanguageClientState.NotAvailable} language={this._fileType} />)
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

const IconContainer = styled.span`
        padding-right: 6px;
        min-width: 14px;
        text-align: center;
    `
const StatusRendererContainer = styled.div`
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        background-color: rgb(35, 35, 35);
        color: rgb(200, 200, 200);
        padding-right: 8px;
        padding-left: 8px;
`

const StatusBarRenderer = (props: StatusBarRendererProps) => {

    const openDevTools = () => {
        electron.remote.getCurrentWindow().webContents.openDevTools()
    }

    const onClick = props.state === LanguageClientState.Error ? openDevTools : null

    const iconName = getIconFromStatus(props.state)

    const icon = iconName ? (
        <IconContainer>
            <Icon
                name={iconName}
                className={getClassNameFromstatus(props.state)}
            />
        </IconContainer>
    ) : null

    return (
        <StatusRendererContainer onClick={onClick}>
            {icon}
            <span>{props.language}</span>
        </StatusRendererContainer>
    )
}
