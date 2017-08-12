/**
 * NeovimEditor.ts
 *
 * IEditor implementation for Neovim
 */

import * as React from "react"


import { IncrementalDeltaRegionTracker } from "./../DeltaRegionTracker"
import { NeovimInstance } from "./../neovim"
import { CanvasRenderer, DOMRenderer, INeovimRenderer } from "./../Renderer"
import { NeovimScreen } from "./../Screen"

import * as Config from "./../Config"

// import { PluginManager } from "./../Plugins/PluginManager"

// import { Keyboard } from "./../Input/Keyboard"
import { IEditor } from "./Editor"

import { NeovimRenderer } from "./NeovimRenderer"

export class DummyPluginManager {
    public getAllRuntimePaths(): string[] {
        return []
    }

    public startPlugins(neovimInstance: NeovimInstance): void {
        // no-op
    }
}

export class SimpleNeovimEditor implements IEditor {

    private _neovimInstance: NeovimInstance
    private _deltaRegionManager: IncrementalDeltaRegionTracker
    private _renderer: INeovimRenderer
    private _screen: NeovimScreen

    private _pendingTimeout: any = null
    private _pendingAnimationFrame: boolean = false

    constructor(
        private _config: Config.Config = Config.instance(),
    ) {
        // TODO: How to get rid of this?
        this._neovimInstance = new NeovimInstance(new DummyPluginManager(), 100, 100)
        this._deltaRegionManager = new IncrementalDeltaRegionTracker()
        this._screen = new NeovimScreen(this._deltaRegionManager)

        this._renderer = this._config.getValue("editor.renderer") === "canvas" ? new CanvasRenderer() : new DOMRenderer()

        this._render()

        this._config.registerListener(() => this._onConfigChanged())

        this._neovimInstance.on("action", (action: any) => {
            this._renderer.onAction(action)
            this._screen.dispatch(action)

            this._scheduleRender()

            if (!this._pendingTimeout) {
                this._pendingTimeout = setTimeout(() => this._onUpdate(), 0)
            }
        })

        this._onConfigChanged()
    }

    public init(filesToOpen: string[]): void {
        this._neovimInstance.start(filesToOpen)
    }

    public render(): JSX.Element {
        return <NeovimRenderer
                    renderer={this._renderer}
                    neovimInstance={this._neovimInstance}
                    deltaRegionTracker={this._deltaRegionManager} />
    }

    private _onConfigChanged(): void {
        this._neovimInstance.setFont(this._config.getValue("editor.fontFamily"), this._config.getValue("editor.fontSize"))
        this._onUpdate()
        this._scheduleRender()
    }

    private _onUpdate(): void {
        if (!!this._pendingTimeout) {
            clearTimeout(this._pendingTimeout) // FIXME: null
            this._pendingTimeout = null
        }
    }

    private _scheduleRender(): void {
        if (this._pendingAnimationFrame) {
            return
        }

        this._pendingAnimationFrame = true
        window.requestAnimationFrame(() => this._render())
    }

    private _render(): void {
        this._pendingAnimationFrame = false

        if (this._pendingTimeout) {
            // UI.Actions.setCursorPosition(this._screen)
        }

        this._renderer.update(this._screen, this._deltaRegionManager)
        this._deltaRegionManager.cleanUpRenderedCells()
    }
}
