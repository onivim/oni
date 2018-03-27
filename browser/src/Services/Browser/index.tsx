/**
 * oni-layer-browser/index.ts
 *
 * Entry point for browser integration plugin
 */

import { shell } from "electron"
import * as Oni from "oni-api"

import { CommandManager } from "./../CommandManager"
import { Configuration } from "./../Configuration"
import { EditorManager } from "./../EditorManager"

import { BrowserLayer } from "./BrowserLayer"

export const activate = (
    commandManager: CommandManager,
    configuration: Configuration,
    editorManager: EditorManager,
) => {
    let count = 0

    const activeLayers: { [bufferId: string]: BrowserLayer } = {}

    const openUrl = async (url: string, openMode: Oni.FileOpenMode = Oni.FileOpenMode.NewTab) => {
        if (configuration.getValue("experimental.browser.enabled")) {
            url = url || configuration.getValue("browser.defaultUrl")

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

    if (configuration.getValue("experimental.browser.enabled")) {
        commandManager.registerCommand({
            command: "browser.openUrl.verticalSplit",
            name: "Browser: Open in Vertical Split",
            detail: "Open a browser window",
            execute: (url?: string) => openUrl(url, Oni.FileOpenMode.VerticalSplit),
        })

        commandManager.registerCommand({
            command: "browser.openUrl.horizontalSplit",
            name: "Browser: Open in Horizontal Split",
            detail: "Open a browser window",
            execute: (url?: string) => openUrl(url, Oni.FileOpenMode.HorizontalSplit),
        })
    }

    configuration.registerSetting("browser.zoomFactor", {
        description:
            "This sets the `zoomFactor` for nested browser windows. A value of `1` means `100%` zoom, a value of 0.5 means `50%` zoom, and a value of `2` means `200%` zoom.",
        requiresReload: false,
        defaultValue: 1,
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
        !!configuration.getValue("experimental.browser.enabled")

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
