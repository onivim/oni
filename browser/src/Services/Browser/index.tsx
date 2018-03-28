/**
 * oni-layer-browser/index.ts
 *
 * Entry point for browser integration plugin
 */

import { shell } from "electron"
import * as React from "react"

import * as Oni from "oni-api"
import { Event } from "oni-types"

import { CommandManager } from "./../CommandManager"
import { Configuration } from "./../Configuration"
import { EditorManager } from "./../EditorManager"

import { BrowserView } from "./BrowserView"

export class BrowserLayer implements Oni.BufferLayer {
    private _debugEvent = new Event<void>()
    private _goBackEvent = new Event<void>()
    private _goForwardEvent = new Event<void>()
    private _reloadEvent = new Event<void>()

    constructor(private _url: string, private _configuration: Configuration) {}

    public get id(): string {
        return "oni.browser"
    }

    public render(): JSX.Element {
        return (
            <BrowserView
                configuration={this._configuration}
                initialUrl={this._url}
                goBack={this._goBackEvent}
                goForward={this._goForwardEvent}
                reload={this._reloadEvent}
                debug={this._debugEvent}
            />
        )
    }

    public openDebugger(): void {
        this._debugEvent.dispatch()
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

    const browserEnabledSetting = configuration.registerSetting("browser.enabled", {
        requiresReload: false,
        description:
            "`browser.enabled` controls whether the embedded browser functionality is enabled",
        defaultValue: true,
    })

    configuration.registerSetting("browser.zoomFactor", {
        description:
            "This sets the `zoomFactor` for nested browser windows. A value of `1` means `100%` zoom, a value of 0.5 means `50%` zoom, and a value of `2` means `200%` zoom.",
        requiresReload: false,
        defaultValue: 1,
    })

    const defaultUrlSetting = configuration.registerSetting("browser.defaultUrl", {
        description:
            "`browser.defaultUrl` sets the default url when opening a browser window, and no url was specified.",
        requiresReload: false,
        defaultValue: "https://github.com/onivim/oni",
    })

    const openUrl = async (url: string, openMode: Oni.FileOpenMode = Oni.FileOpenMode.NewTab) => {
        if (browserEnabledSetting.getValue()) {
            url = url || defaultUrlSetting.getValue()

            count++
            const buffer: Oni.Buffer = await editorManager.activeEditor.openFile(
                "Browser" + count.toString(),
                { openMode },
            )

            const layer = new BrowserLayer(url, configuration)
            buffer.addLayer(layer)
            activeLayers[buffer.id] = layer
        } else {
            shell.openExternal(url)
        }
    }

    commandManager.registerCommand({
        command: "browser.openUrl.verticalSplit",
        name: "Browser: Open in Vertical Split",
        detail: "Open a browser window",
        execute: (url?: string) => openUrl(url, Oni.FileOpenMode.VerticalSplit),
        enabled: () => browserEnabledSetting.getValue(),
    })

    commandManager.registerCommand({
        command: "browser.openUrl.horizontalSplit",
        name: "Browser: Open in Horizontal Split",
        detail: "Open a browser window",
        execute: (url?: string) => openUrl(url, Oni.FileOpenMode.HorizontalSplit),
        enabled: () => browserEnabledSetting.getValue(),
    })

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
        browserEnabledSetting.getValue()

    // Per-layer commands
    commandManager.registerCommand({
        command: "browser.debug",
        execute: executeCommandForLayer(browser => browser.openDebugger()),
        name: "Browser: Open DevTools",
        detail: "Open the devtools pane for the current browser window.",
        enabled: isBrowserLayerActive,
    })

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
