/**
 * NeovimEditor.ts
 *
 * IEditor implementation for Neovim
 */

import * as fs from "fs"

import * as React from "react"

import { IncrementalDeltaRegionTracker } from "./../DeltaRegionTracker"
import { NeovimInstance } from "./../neovim"
import { INeovimRenderer } from "./../Renderer"
import { IScreen, NeovimScreen } from "./../Screen"
import { IDeltaRegionTracker } from "./../DeltaRegionTracker"

import * as Config from "./../Config"

// import { PluginManager } from "./../Plugins/PluginManager"

import { Keyboard } from "./../Input/Keyboard"
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

export class FileExplorerRenderer implements INeovimRenderer {
    private _element: HTMLElement
    public start(element: HTMLElement): void {
        element.innerHTML = "hello world"
        this._element = element

    }

    public update(screenInfo: IScreen, deltaRegionTracker: IDeltaRegionTracker): void {
        if (!this._element)
            return

        this._element.innerHTML = ""

        const getTextFromRow = (y: number) => {
            let str =""
            for(let x = 0; x < screenInfo.width; x++) {
                const cell = screenInfo.getCell(x, y)
                const character = cell.character

                str = str + character
            }

            return str
        }

        for (let y = 0; y < screenInfo.height; y++) {
            const text = getTextFromRow(y)
            const elem = document.createElement("div")
            elem.textContent = text

            elem.style.color = screenInfo.foregroundColor
            elem.style.backgroundColor = screenInfo.backgroundColor

            if (y === screenInfo.cursorRow) {
                elem.style.color = screenInfo.backgroundColor
                elem.style.backgroundColor = screenInfo.foregroundColor
            }

            this._element.appendChild(elem)
        }
    }

    public onAction(action: any): void {
    }

    public onResize(): void {
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
        this._neovimInstance.setInitVim("C:/oni/test.vim")
        this._deltaRegionManager = new IncrementalDeltaRegionTracker()
        this._screen = new NeovimScreen(this._deltaRegionManager)

        this._renderer = new FileExplorerRenderer()

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

        const keyboard = new Keyboard()
        keyboard.on("keydown", (key: string) => {
            this._neovimInstance.input(key)
        })

        this._onConfigChanged()
    }

    public async setDummyText(): Promise<void> {
        console.log("getting buffer")
        const buf = await this._neovimInstance.getCurrentBuffer()
        console.log("got buffer")
        
        const files = fs.readdirSync(process.cwd())
        await buf.setLines(0, 1, false, files)
        console.log("set lines")
    }

    public init(filesToOpen: string[]): void {
        this._neovimInstance.start(filesToOpen)
            .then(() => this.setDummyText())
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
