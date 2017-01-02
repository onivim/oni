// import * as _ from "lodash"
// import * as Config from "./../Config"
import { IDeltaRegionTracker } from "./../DeltaRegionTracker"
// import { Grid } from "./../Grid"
import { ICell, IScreen } from "./../Screen"
import { INeovimRenderer } from "./INeovimRenderer"
// import { RenderCache } from "./RenderCache"

export interface ITokenRenderer {
    canHandleCell(cell: ICell): boolean
    appendCell(cell: ICell): void
    getTag(): HTMLElement
}

export class DOMRenderer implements INeovimRenderer {
    private _editorElement: HTMLDivElement

    public start(element: HTMLDivElement): void {
        // Assert canvas
        this._editorElement = element
    }

    public onAction(_action: any): void {
    }

    public onResize(): void {
    }

    public update(screenInfo: IScreen, deltaRegionTracker: IDeltaRegionTracker): void {

        if (deltaRegionTracker.getModifiedCells().length === 0)
            return

        this._editorElement.innerHTML = ""
        this._editorElement.style.fontFamily = screenInfo.fontFamily
        this._editorElement.style.fontSize = screenInfo.fontSize
        const width = screenInfo.width
        const height = screenInfo.height

        for (let y = 0; y < height; y++) {
            const div = document.createElement("div")
            div.style.position = "absolute"
            div.style.left = "0px"
            div.style.top = (screenInfo.fontHeightInPixels * y) + "px"
            let currentRenderer: ITokenRenderer | null = null

            for (let x = 0; x < width; x++) {

                const cell = screenInfo.getCell(x, y)

                if (!currentRenderer) {
                    currentRenderer = getRendererForCell(x, cell, screenInfo)
                } else if (!currentRenderer.canHandleCell(cell)) {
                    div.appendChild(currentRenderer.getTag())
                    currentRenderer = getRendererForCell(x, cell, screenInfo)
                } 

                if(currentRenderer) {
                    currentRenderer.appendCell(cell)
                }

                deltaRegionTracker.notifyCellRendered(x, y)
            }

            if (currentRenderer) {
                const tag = currentRenderer.getTag()
                div.appendChild(tag)
            }

            this._editorElement.appendChild(div)
        }
    }
}

export class BaseTokenRenderer {

    private _screen: IScreen
    private _backgroundColor: string | undefined
    private _foregroundColor: string | undefined
    private _x: number

    protected get screen(): IScreen {
        return this._screen
    }

    constructor(x: number, cell: ICell, screen: IScreen) {
        this._foregroundColor = cell.foregroundColor
        this._backgroundColor = cell.backgroundColor
        this._screen = screen
        this._x = x
    }

    public canHandleCell(cell: ICell): boolean {
        return this._foregroundColor === cell.foregroundColor && this._backgroundColor === cell.backgroundColor
    }

    public getTag(): HTMLElement {

        const span = document.createElement("span")
        span.style.position = "absolute"
        span.style.left = (this._x * this.screen.fontWidthInPixels) + "px"
        span.style.height = this.screen.fontHeightInPixels + "px"

        if(this._backgroundColor && this._backgroundColor !== this._screen.backgroundColor) {
            span.style.backgroundColor = this._backgroundColor
        }

        if (this._foregroundColor) {
            span.style.color = this._foregroundColor
        }
        return span

    }
}

export class WhiteSpaceTokenRenderer extends BaseTokenRenderer implements ITokenRenderer {

    private _whitespaceCount = 0

    constructor(x: number, cell: ICell, screen: IScreen) {
        super(x, cell, screen)
    }

    public canHandleCell(cell: ICell): boolean {
        return isWhiteSpace(cell)
    }

    public appendCell(): void {
        this._whitespaceCount++
    }

    public getTag(): HTMLElement {
        const span = super.getTag()
        span.className = "whitespace"
        span.style.width = (this._whitespaceCount * this.screen.fontWidthInPixels) + "px"
        return span
    }
}

export class SimpleRenderer extends BaseTokenRenderer implements ITokenRenderer {

    private _str: string = ""

    constructor(x: number, cell: ICell, screen: IScreen) {
        super(x, cell, screen)
    }

    public canHandleCell(cell: ICell): boolean {
        return !isWhiteSpace(cell)
    }

    public appendCell(cell: ICell): void {
        this._str += cell.character
    }

    public getTag(): HTMLElement {
        const span = super.getTag()
        span.innerHTML = this._str
        span.style.width = ((this._str.length+1) * this.screen.fontWidthInPixels) + "px"
        return span
    }

}

export function getRendererForCell(x: number, cell: ICell, screen: IScreen) {
    if(isWhiteSpace(cell))
        return new WhiteSpaceTokenRenderer(x, cell, screen)
    else
        return new SimpleRenderer(x, cell, screen)
}

function isWhiteSpace(cell: ICell): boolean {
    const character = cell.character

    return character === " " || character === "" || character === "\t" || character === "\n" || character === "\r"
}
