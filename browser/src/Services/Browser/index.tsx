/**
 * oni-layer-browser/index.ts
 *
 * Entry point for browser integration plugin
 */

import { ipcRenderer, shell, WebviewTag } from "electron"
import * as React from "react"

import * as Oni from "oni-api"
import { Event } from "oni-types"

import { IBuffer } from "./../../Editor/BufferManager"

import { CommandManager } from "./../CommandManager"
import { Configuration } from "./../Configuration"
import { EditorManager } from "./../EditorManager"
import { focusManager } from "./../FocusManager"
import {
    AchievementsManager,
    getInstance as getAchievementsInstance,
} from "./../Learning/Achievements"

import { BrowserView } from "./BrowserView"

export class BrowserLayer implements Oni.BufferLayer {
    private _debugEvent = new Event<void>("Browser::debugEvent")
    private _goBackEvent = new Event<void>("Browser::goBackEvent")
    private _goForwardEvent = new Event<void>("Browser::goForwardEvent")
    private _reloadEvent = new Event<void>("Browser::reloadEvent")
    private _scrollUpEvent = new Event<void>("Browser::scrollUpEvent")
    private _scrollDownEvent = new Event<void>("Browser::scrollDownEvent")
    private _scrollRightEvent = new Event<void>("Browser::scrollRightEvent")
    private _scrollLeftEvent = new Event<void>("Browser::scrollLeftEvent")

    private _webview: WebviewTag | null = null
    private _activeTagName: string | null = null

    constructor(private _url: string, private _configuration: Configuration) {}

    public get id(): string {
        return "oni.browser"
    }

    public get webviewElement(): HTMLElement {
        return this._webview
    }

    public get activeTagName(): string {
        return this._activeTagName
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
                scrollDown={this._scrollDownEvent}
                scrollUp={this._scrollUpEvent}
                scrollLeft={this._scrollLeftEvent}
                scrollRight={this._scrollRightEvent}
                webviewRef={webview => (this._webview = webview)}
                onFocusTag={newTag => (this._activeTagName = newTag)}
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

    public scrollUp(): void {
        this._scrollUpEvent.dispatch()
    }

    public scrollDown(): void {
        this._scrollDownEvent.dispatch()
    }

    public scrollLeft(): void {
        this._scrollLeftEvent.dispatch()
    }

    public scrollRight(): void {
        this._scrollRightEvent.dispatch()
    }
}
export const activate = (
    commandManager: CommandManager,
    configuration: Configuration,
    editorManager: EditorManager,
) => {
    let count = 0

    const browserEnabledSetting = configuration.registerSetting("browser.enabled", {
        requiresReload: false,
        description:
            "`browser.enabled` controls whether the embedded browser functionality is enabled",
        defaultValue: true,
    })

    configuration.registerSetting("browser.zoomFactor", {
        description: `This sets the "zoomFactor" for nested browser windows.
        A value of "1" means "100%" zoom, a value of 0.5 means
        "50%" zoom, and a value of "2" means "200%" zoom.`,
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

            const achievements = getAchievementsInstance()
            achievements.notifyGoal("oni.goal.openBrowser")
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

    const getLayerForBuffer = (buffer: Oni.Buffer): BrowserLayer => {
        return (buffer as IBuffer).getLayerById<BrowserLayer>("oni.browser")
    }

    const executeCommandForLayer = (callback: (browserLayer: BrowserLayer) => void) => () => {
        const activeBuffer = editorManager.activeEditor.activeBuffer

        const browserLayer = getLayerForBuffer(activeBuffer)
        if (browserLayer) {
            callback(browserLayer)
        }
    }

    const isBrowserCommandEnabled = (): boolean => {
        if (!browserEnabledSetting.getValue()) {
            return false
        }

        const layer = getLayerForBuffer(editorManager.activeEditor.activeBuffer)
        if (!layer) {
            return false
        }

        // If the layer is open, but not focused, we shouldn't execute commands.
        // This could happen if there is a pop-up menu, or if we're working with some
        // non-webview UI in the browser (like the address bar)
        if (layer.webviewElement !== focusManager.focusedElement) {
            return false
        }

        return true
    }

    const isInputTag = (tagName: string): boolean => {
        return tagName === "INPUT" || tagName === "TEXTAREA"
    }

    const isBrowserScrollCommandEnabled = (): boolean => {
        if (!isBrowserCommandEnabled()) {
            return false
        }

        const layer = getLayerForBuffer(editorManager.activeEditor.activeBuffer)

        // Finally, if the webview _is_ focused, but something has focus, we'll
        // skip our bindings and defer to the browser
        if (isInputTag(layer.activeTagName)) {
            return false
        }

        return true
    }

    // Per-layer commands
    commandManager.registerCommand({
        command: "browser.debug",
        execute: executeCommandForLayer(browser => browser.openDebugger()),
        name: "Browser: Open DevTools",
        detail: "Open the devtools pane for the current browser window.",
        enabled: isBrowserCommandEnabled,
    })

    commandManager.registerCommand({
        command: "browser.goBack",
        execute: executeCommandForLayer(browser => browser.goBack()),
        name: "Browser: Go back",
        detail: "",
        enabled: isBrowserCommandEnabled,
    })

    commandManager.registerCommand({
        command: "browser.goForward",
        execute: executeCommandForLayer(browser => browser.goForward()),
        name: "Browser: Go forward",
        detail: "",
        enabled: isBrowserCommandEnabled,
    })

    commandManager.registerCommand({
        command: "browser.reload",
        execute: executeCommandForLayer(browser => browser.reload()),
        name: "Browser: Reload",
        detail: "",
        enabled: isBrowserCommandEnabled,
    })

    commandManager.registerCommand({
        command: "browser.scrollDown",
        execute: executeCommandForLayer(browser => browser.scrollDown()),
        name: "Browser: Scroll Down",
        detail: "",
        enabled: isBrowserScrollCommandEnabled,
    })

    commandManager.registerCommand({
        command: "browser.scrollUp",
        execute: executeCommandForLayer(browser => browser.scrollUp()),
        name: "Browser: Scroll Up",
        detail: "",
        enabled: isBrowserScrollCommandEnabled,
    })

    commandManager.registerCommand({
        command: "browser.scrollLeft",
        execute: executeCommandForLayer(browser => browser.scrollLeft()),
        name: "Browser: Scroll Left",
        detail: "",
        enabled: isBrowserScrollCommandEnabled,
    })

    commandManager.registerCommand({
        command: "browser.scrollRight",
        execute: executeCommandForLayer(browser => browser.scrollRight()),
        name: "Browser: Scroll Right",
        detail: "",
        enabled: isBrowserScrollCommandEnabled,
    })

    ipcRenderer.on("open-oni-browser", (event: string, args: string) => {
        openUrl(args)
    })
}

export const registerAchievements = (achievements: AchievementsManager) => {
    achievements.registerAchievement({
        uniqueId: "oni.achievement.openBrowser",
        name: "Browserception",
        description: "Open a browser window inside Oni",
        goals: [
            {
                name: null,
                goalId: "oni.goal.openBrowser",
                count: 1,
            },
        ],
    })

    achievements.registerAchievement({
        uniqueId: "oni.achievement.sneakIntoBrowser",
        name: "Incognito",
        dependsOnId: "oni.achievement.openBrowser",
        description: "Use 'sneak' to interact with UI in the browser.",
        goals: [
            {
                name: null,
                goalId: "oni.goal.sneakIntoBrowser",
                count: 1,
            },
        ],
    })
}
