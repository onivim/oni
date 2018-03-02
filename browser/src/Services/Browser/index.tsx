/**
 * oni-layer-browser/index.ts
 *
 * Entry point for browser integration plugin
 */

import { shell } from "electron"
import * as React from "react"
import styled from "styled-components"

import * as Oni from "oni-api"
import { Event, IDisposable, IEvent } from "oni-types"

import { CommandManager } from "./../CommandManager"
import { Configuration } from "./../Configuration"
import { EditorManager } from "./../EditorManager"

import { Icon, IconSize } from "./../../UI/Icon"

import { BrowserView } from "./BrowserView"
export class BrowserLayer implements Oni.BufferLayer {
    private _goBackEvent = new Event<void>()
    private _goForwardEvent = new Event<void>()
    private _reloadEvent = new Event<void>()

    constructor(private _url: string) {}

    public get id(): string {
        return "oni.browser"
    }

    public render(): JSX.Element {
        return (
            <BrowserView
                url={this._url}
                goBack={this._goBackEvent}
                goForward={this._goForwardEvent}
                reload={this._reloadEvent}
            />
        )
    }

    public goBack(): void {
        this._goBackEvent.dispatch()
    }

    public goForward(): void {
        this._goForwardEvent.dispatch()
    }

    public reload(): void {
        this._reloadEvent.dispatch()
    }
}

export const activate = (
    commandManager: CommandManager,
    configuration: Configuration,
    editorManager: EditorManager,
) => {
    let count = 0

    const activeLayers: { [bufferId: string]: BrowserLayer } = {}

    const openUrl = async (url: string) => {
        if (configuration.getValue("experimental.browser.enabled")) {
            count++
            const buffer: Oni.Buffer = await (editorManager.activeEditor as any).newFile(
                "Browser" + count.toString(),
            )

            const layer = new BrowserLayer(url)
            buffer.addLayer(layer)
            activeLayers[buffer.id] = layer
        } else {
            shell.openExternal(url)
        }
    }

    commandManager.registerCommand({
        command: "browser.openUrl",
        execute: openUrl,
        name: null,
        detail: null,
    })

    const executeCommandForLayer = (callback: (browserLayer: BrowserLayer) => void) => () => {
        const activeBuffer = editorManager.activeEditor.activeBuffer

        const browserLayer = activeLayers[activeBuffer.id]
        if (browserLayer) {
            callback(browserLayer)
        }
    }

    const isBrowserLayerActive = () =>
        !!activeLayers[editorManager.activeEditor.activeBuffer.id] &&
        !!configuration.getValue("experimental.browser.enabled")

    // Per-layer commands
    commandManager.registerCommand({
        command: "browser.goBack",
        execute: executeCommandForLayer(browser => browser.goBack()),
        name: "Browser: Go back",
        detail: "",
        enabled: isBrowserLayerActive,
    })

    commandManager.registerCommand({
        command: "browser.goForward",
        execute: executeCommandForLayer(browser => browser.goForward()),
        name: "Browser: Go forward",
        detail: "",
        enabled: isBrowserLayerActive,
    })

    commandManager.registerCommand({
        command: "browser.reload",
        execute: executeCommandForLayer(browser => browser.reload()),
        name: "Browser: Reload",
        detail: "",
        enabled: isBrowserLayerActive,
    })
}
