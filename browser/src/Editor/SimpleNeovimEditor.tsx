/**
 * NeovimEditor.ts
 *
 * IEditor implementation for Neovim
 */

import * as fs from "fs"

import * as React from "react"
import * as ReactDOM from "react-dom"

import { IncrementalDeltaRegionTracker } from "./../DeltaRegionTracker"
import { NeovimInstance } from "./../neovim"
import { INeovimRenderer } from "./../Renderer"
import { IScreen, NeovimScreen } from "./../Screen"
import { IDeltaRegionTracker } from "./../DeltaRegionTracker"

import { CommonNeovimEditor } from "./NeovimEditor"

import { Icon } from "./../UI/Icon"

import * as Config from "./../Config"

// import { PluginManager } from "./../Plugins/PluginManager"

import { IEditor } from "./Editor"

import { NeovimRenderer } from "./NeovimRenderer"

export class DummyPluginManager {
    public getAllRuntimePaths(): string[] {
        return []
    }

    public startPlugins(neovimInstance: NeovimInstance): Oni.Plugin.Api {
        return null
        // no-op
    }
}

export interface IFileExplorerProps {
    lines: string[]
    selectedLine: number
    backgroundColor: string
    foregroundColor: string
}

export const FileExplorerComponent = (props: IFileExplorerProps): JSX.Element => {

    const style = {
        color: props.foregroundColor,
        backgroundColor: props.backgroundColor,
    }

    const selectedStyle = {
        color: props.backgroundColor,
        backgroundColor: props.foregroundColor,
    }

    const contents = props.lines.map((l, i) => {

        const itemStyle = i === props.selectedLine ? selectedStyle : null

        return <div style={itemStyle}><Icon name={"file-o"} /><span>{l}</span></div>
    })
    return <div style={style}>
        {contents}
    </div>
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

        const getTextFromRow = (y: number) => {
            let str =""
            for(let x = 0; x < screenInfo.width; x++) {
                const cell = screenInfo.getCell(x, y)
                const character = cell.character

                str = str + character
            }

            return str
        }

        let lines: string[] = []

        for (let y = 0; y < screenInfo.height; y++) {
            const text = getTextFromRow(y)
            lines = lines.concat(text)
            const elem = document.createElement("div")
            elem.textContent = text

            elem.style.color = screenInfo.foregroundColor
            elem.style.backgroundColor = screenInfo.backgroundColor

            if (y === screenInfo.cursorRow) {
                elem.style.color = screenInfo.backgroundColor
                elem.style.backgroundColor = screenInfo.foregroundColor
            }
        }

        console.dir(lines)

        ReactDOM.render(<FileExplorerComponent lines={lines} selectedLine={screenInfo.cursorRow} backgroundColor={screenInfo.backgroundColor} foregroundColor={screenInfo.foregroundColor}/>, this._element)
    }

    public onAction(action: any): void {
    }

    public onResize(): void {
    }
}

export class SimpleNeovimEditor extends CommonNeovimEditor implements IEditor {

    private _deltaRegionManager: IncrementalDeltaRegionTracker
    private _renderer: INeovimRenderer
    private _screen: NeovimScreen

    constructor(
    ) {
        super(new DummyPluginManager(), Config.instance())
        // TODO: How to get rid of this?
        this.neovimInstance.setInitVim("C:/oni/test.vim")
        this.neovimInstance.setInitVim("C:/oni/test.vim")
        this._deltaRegionManager = new IncrementalDeltaRegionTracker()
        this._screen = new NeovimScreen(this._deltaRegionManager)

        this._renderer = new FileExplorerRenderer()

        this._render()

    }

    public async setDummyText(): Promise<void> {
        console.log("getting buffer")
        const buf = await this.neovimInstance.getCurrentBuffer()
        console.log("got buffer")
        
        const files = fs.readdirSync(process.cwd())
        await buf.setLines(0, 1, false, files)
        console.log("set lines")
    }

    public init(filesToOpen: string[]): Promise<void> {
        return super.init(filesToOpen)
            .then(() => this.setDummyText())
    }

    public render(): JSX.Element {
        return <NeovimRenderer
                    renderer={this._renderer}
                    neovimInstance={this.neovimInstance}
                    deltaRegionTracker={this._deltaRegionManager} />
    }

    protected /* override */ _onAction(action: any): void {
        super._onAction(action)
        this._renderer.onAction(action)
        this._screen.dispatch(action)
    }

    protected /* override */ _render(): void {
        super._render()

        this._renderer.update(this._screen, this._deltaRegionManager)
        this._deltaRegionManager.cleanUpRenderedCells()
    }
}
