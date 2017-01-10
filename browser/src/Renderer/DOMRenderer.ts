import { IDeltaRegionTracker } from "./../DeltaRegionTracker"
import { Grid } from "./../Grid"
import { ICell, IScreen } from "./../Screen"
import { INeovimRenderer } from "./INeovimRenderer"

export interface ITokenRenderer {
    x: number
    y: number
    width: number

    canHandleCell(cell: ICell): boolean
    appendCell(cell: ICell): void
    getTag(): HTMLElement | null
}

export interface IElementInfo {
    x: number
    width: number
    element: HTMLElement | null
}

export class DOMRenderer implements INeovimRenderer {
    private _editorElement: HTMLDivElement
    private _grid: Grid<IElementInfo> = new Grid<IElementInfo>()

    public start(element: HTMLDivElement): void {
        this._editorElement = element
    }

    public onAction(_action: any): void {
    }

    public onResize(): void {
    }

    public update(screenInfo: IScreen, deltaRegionTracker: IDeltaRegionTracker): void {

        if (deltaRegionTracker.getModifiedCells().length === 0) {
            return
        }

        // Get all 'spans'
        const rowToSpans = {}
        deltaRegionTracker.getModifiedCells().forEach((cell) => {
            const {x, y} = cell

            const info = this._grid.getCell(x, y)

            rowToSpans[y] = rowToSpans[y] || []

            if (!info) {
                rowToSpans[y].push({x, y, width: 1})
                return
            }

            rowToSpans[y].push({
                x: info.x,
                width: info.width,
                y: y
            })

            if (info.element) {
                info.element.remove()
            }

            this._grid.setRegion(x, y, info.width, 1, null)
        })

        // TODO: Get rid of this
        this._editorElement.innerHTML = ""
        this._editorElement.style.fontFamily = screenInfo.fontFamily
        this._editorElement.style.fontSize = screenInfo.fontSize
        const width = screenInfo.width
        const height = screenInfo.height

        for (let y = 0; y < height; y++) {
            let currentRenderer: ITokenRenderer | null = null

            for (let x = 0; x < width; x++) {

                const cell = screenInfo.getCell(x, y)

                if (!currentRenderer) {
                    currentRenderer = getRendererForCell(x, y, cell, screenInfo)
                } else if (!currentRenderer.canHandleCell(cell)) {
                    this._applyRenderedToken(currentRenderer)
                    currentRenderer = getRendererForCell(x, y, cell, screenInfo)
                }

                if (currentRenderer) {
                    currentRenderer.appendCell(cell)
                }

                deltaRegionTracker.notifyCellRendered(x, y)
            }

            if (currentRenderer) {
                this._applyRenderedToken(currentRenderer)
            }
        }
    }

    /**
     * Apply the token to the DOM, and update our grid storage to reflect the state
     */
    private _applyRenderedToken(renderer: ITokenRenderer): void {
        const { y, width } = renderer
        const startX = renderer.x

        const tag = renderer.getTag()

        if (tag) {
            this._editorElement.appendChild(tag)
        }

        const element = tag || null

        const infoToSave = {
            x: startX,
            width: width,
            element: element
        }

        for(let x = startX; x < startX + width; x++) {
            this._grid.setCell(x, y, infoToSave)
        }
    }
}

export class BaseTokenRenderer {

    private _screen: IScreen
    private _backgroundColor: string | undefined
    private _foregroundColor: string | undefined
    private _x: number
    private _y: number
    private _width: number = 0

    private _lastCell: ICell // TODO: This is just used to work around TS compiler... Specifically, it doesn't like `cell` being passedin appendCell to be overridden

    public get x(): number {
        return this._x
    }

    public get y(): number {
        return this._y
    }

    public get width(): number {
        return this._width
    }

    protected get screen(): IScreen {
        return this._screen
    }

    protected get foregroundColor(): string | undefined {
        return this._foregroundColor
    }

    protected get backgroundColor(): string | undefined {
        return this._backgroundColor
    }

    constructor(x: number, y: number, cell: ICell, screen: IScreen) {
        this._foregroundColor = cell.foregroundColor
        this._backgroundColor = cell.backgroundColor
        this._screen = screen
        this._x = x
        this._y = y
    }

    public canHandleCell(cell: ICell): boolean {
        return this._foregroundColor === cell.foregroundColor && this._backgroundColor === cell.backgroundColor
    }

    public appendCell(cell: ICell): void {
        this._lastCell = cell

        this._width++
    }

    public getDefaultTag(): HTMLElement {

        const span = document.createElement("span")
        span.style.position = "absolute"
        span.style.top = (this._y * this.screen.fontHeightInPixels) + "px"
        span.style.left = (this._x * this.screen.fontWidthInPixels) + "px"
        span.style.height = this.screen.fontHeightInPixels + "px"

        if (this._backgroundColor && this._backgroundColor !== this._screen.backgroundColor) {
            span.style.backgroundColor = this._backgroundColor
        }

        span.style.color = this._foregroundColor || this._screen.foregroundColor
        return span

    }
}

export class WhiteSpaceTokenRenderer extends BaseTokenRenderer implements ITokenRenderer {

    constructor(x: number, y: number, cell: ICell, screen: IScreen) {
        super(x, y, cell, screen)
    }

    public canHandleCell(cell: ICell): boolean {
        return super.canHandleCell(cell) && isWhiteSpace(cell)
    }

    public getTag(): HTMLElement | null {
        if (!this.backgroundColor || this.backgroundColor === this.screen.backgroundColor)
            return null

        const span = super.getDefaultTag()
        span.className = "whitespace"
        span.style.width = (this.width * this.screen.fontWidthInPixels) + "px"
        return span
    }
}

export class TokenRenderer extends BaseTokenRenderer implements ITokenRenderer {

    private _str: string = ""

    constructor(x: number, y: number, cell: ICell, screen: IScreen) {
        super(x, y, cell, screen)
    }

    public canHandleCell(cell: ICell): boolean {
        return super.canHandleCell(cell) && !isWhiteSpace(cell)
    }

    public appendCell(cell: ICell): void {
        super.appendCell(cell)

        if (cell.characterWidth > 0) {
            this._str += cell.character
        }
    }

    public getTag(): HTMLElement | null {
        const span = super.getDefaultTag()
        span.textContent = this._str
        span.style.width = ((this._str.length + 1) * this.screen.fontWidthInPixels) + "px"
        return span
    }

}

export function getRendererForCell(x: number, y: number, cell: ICell, screen: IScreen) {
    if (isWhiteSpace(cell)) {
        return new WhiteSpaceTokenRenderer(x, y, cell, screen)
    } else {
        return new TokenRenderer(x, y, cell, screen)
    }
}

function isWhiteSpace(cell: ICell): boolean {
    const character = cell.character

    return cell.characterWidth === 1 && (character === " " || character === "" || character === "\t" || character === "\n")
}
