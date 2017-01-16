import { IDeltaCellPosition, IDeltaRegionTracker } from "./../DeltaRegionTracker"
import { Grid } from "./../Grid"
import { ICell, IScreen } from "./../Screen"
import { INeovimRenderer } from "./INeovimRenderer"

// TODO: Add screen level unit tests
// TODO: Improve performance of addOrCoalesceSpan
// TODO: Look at scroll perf

export interface ITokenRenderer {
    x: number
    y: number
    width: number
    backgroundColor: string | undefined
    foregroundColor: string | undefined

    canHandleCell(cell: ICell): boolean
    appendCell(cell: ICell): void
    getTag(): HTMLElement | null
}

export interface IElementFactory {
    getElement(): HTMLSpanElement
    recycle(element: HTMLSpanElement): void
}

export class DocumentElementFactory {
    
    public getElement(): HTMLSpanElement {
        return document.createElement("span")
    }

    public recycle(element: HTMLSpanElement): void {
        element.remove()
        // no-op
    }
}

export interface ISpan {
    startX: number
    endX: number
}

export interface ISpanElementInfo extends ISpan {
    element: HTMLElement | null
    foregroundColor: string | undefined
    backgroundColor: string | undefined
}

export class DOMRenderer implements INeovimRenderer {
    private _editorElement: HTMLDivElement
    private _grid: Grid<ISpanElementInfo> = new Grid<ISpanElementInfo>()
    private _elementFactory: IElementFactory

    public start(element: HTMLDivElement, elementFactory?: IElementFactory): void {
        this._elementFactory = elementFactory || new DocumentElementFactory()

        this._editorElement = element
    }

    public onAction(_action: any): void {
        // No-op
    }

    public onResize(): void {
        // No-op
    }

    public update(screenInfo: IScreen, deltaRegionTracker: IDeltaRegionTracker): void {

        const modifiedCells = deltaRegionTracker.getModifiedCells()

        if (modifiedCells.length === 0) {
            return
        }

        this._editorElement.style.fontFamily = screenInfo.fontFamily
        this._editorElement.style.fontSize = screenInfo.fontSize

        const rowsToEdit = getSpansToEdit(this._grid, modifiedCells, this._elementFactory)

        modifiedCells.forEach((c) => deltaRegionTracker.notifyCellRendered(c.x, c.y))

        for (let y of rowsToEdit.keys()) {
            const row = rowsToEdit.get(y)

            if (!row) {
                return
            }

            row.forEach((span: ISpan) => {
                this._renderSpan(span.startX, span.endX, y, screenInfo)

                // check if beginning boundary can be combined
                combineSpansAtBoundary(span.startX, y, screenInfo.fontWidthInPixels, this._grid, this._elementFactory)

                // check if following boundary can be combined
                combineSpansAtBoundary(span.endX + 1, y, screenInfo.fontWidthInPixels, this._grid, this._elementFactory)
            })
        }
    }

    private _renderSpan(startX: number, endX: number, y: number, screenInfo: IScreen): void {
        let currentRenderer: ITokenRenderer | null = null

        for (let x = startX; x < endX; x++) {

            const cell = screenInfo.getCell(x, y)

            if (!currentRenderer) {
                currentRenderer = getRendererForCell(x, y, cell, screenInfo, this._elementFactory)
            } else if (!currentRenderer.canHandleCell(cell)) {
                this._applyRenderedToken(currentRenderer)
                currentRenderer = getRendererForCell(x, y, cell, screenInfo, this._elementFactory)
            }

            if (currentRenderer) {
                currentRenderer.appendCell(cell)
            }
        }

        if (currentRenderer) {
            this._applyRenderedToken(currentRenderer)
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
            startX,
            element,
            endX: startX + width,
            foregroundColor: renderer.foregroundColor,
            backgroundColor: renderer.backgroundColor,
        }

        for (let x = startX; x < startX + width; x++) {
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
    private _elementFactory: IElementFactory

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

    public get foregroundColor(): string | undefined {
        return this._foregroundColor
    }

    public get backgroundColor(): string | undefined {
        return this._backgroundColor
    }

    protected get screen(): IScreen {
        return this._screen
    }

    constructor(x: number, y: number, cell: ICell, screen: IScreen, elementFactory: IElementFactory) {
        this._foregroundColor = cell.foregroundColor
        this._backgroundColor = cell.backgroundColor
        this._screen = screen
        this._x = x
        this._y = y
        this._elementFactory = elementFactory
    }

    public canHandleCell(cell: ICell): boolean {
        return this._foregroundColor === cell.foregroundColor && this._backgroundColor === cell.backgroundColor
    }

    public appendCell(cell: ICell): void {
        this._lastCell = cell

        this._width++
    }

    public getDefaultTag(): HTMLElement {

        const span = this._elementFactory.getElement()
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

    constructor(x: number, y: number, cell: ICell, screen: IScreen, elementFactory: IElementFactory) {
        super(x, y, cell, screen, elementFactory)
    }

    public canHandleCell(cell: ICell): boolean {
        return super.canHandleCell(cell) && isWhiteSpace(cell)
    }

    public getTag(): HTMLElement | null {
        if (!this.backgroundColor || this.backgroundColor === this.screen.backgroundColor) {
            return null
        }

        const span = super.getDefaultTag()
        span.className = "whitespace"
        span.style.width = (this.width * this.screen.fontWidthInPixels) + "px"
        return span
    }
}

export class TokenRenderer extends BaseTokenRenderer implements ITokenRenderer {

    private _str: string = ""

    constructor(x: number, y: number, cell: ICell, screen: IScreen, elementFactory: IElementFactory) {
        super(x, y, cell, screen, elementFactory)
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

export function getRendererForCell(x: number, y: number, cell: ICell, screen: IScreen, elementFactory: IElementFactory) {
    if (isWhiteSpace(cell)) {
        return new WhiteSpaceTokenRenderer(x, y, cell, screen, elementFactory)
    } else {
        return new TokenRenderer(x, y, cell, screen, elementFactory)
    }
}

export function isWhiteSpace(cell: ICell): boolean {
    const character = cell.character

    return cell.characterWidth === 1 && (character === " " || character === "" || character === "\t" || character === "\n")
}

export function addOrCoalesceSpan(existingSpans: ISpan[], newSpan: ISpan): ISpan[] {
    const overlappingSpans = existingSpans.filter((s) =>  {

        if ((newSpan.startX >= s.startX && newSpan.startX <= s.endX)
            || (newSpan.endX >= s.startX && newSpan.endX <= s.endX)) {
                return true
            } else {
                return false
            }
    })

    const nonOverlappingSpans = existingSpans.filter((s) => overlappingSpans.indexOf(s) === -1)

    const combinedSpan = overlappingSpans.reduce((prev, cur) => ({
        startX: Math.min(prev.startX, cur.startX),
        endX: Math.max(prev.endX, cur.endX),
    }), newSpan)

    return nonOverlappingSpans.concat([combinedSpan])
}

/**
 * Checks if it is possible to combine spans at a boundary. Spans can be combined if they have
 * they have the same styling (foreground color and background color). The location will be checked
 * against the span before it
 */
export function combineSpansAtBoundary(x: number, y: number, fontWidthInPixels: number, grid: Grid<ISpanElementInfo>, elementFactory: IElementFactory): void {

    const prevCellX = x - 1

    if (prevCellX < 0) {
        return
    }

    const previousSpan = grid.getCell(prevCellX, y)
    const currentSpan = grid.getCell(x, y)

    // If there isn't a span already at one of the positions, it can't be combined
    if (!previousSpan || !currentSpan) {
        return
    }

    // Check if already combined..
    if (previousSpan.element === currentSpan.element) {
        return
    }

    const previousElement = previousSpan.element
    const currentElement = currentSpan.element

    if (!previousElement || !currentElement) {
        return
    }

    // TODO: Test this
    if ((previousSpan.foregroundColor !== currentSpan.foregroundColor)
        || (previousSpan.backgroundColor !== currentSpan.backgroundColor)) {
            return
        }

    // At this point, we have a candidate to combine

    const previousText = previousElement.textContent
    const currentText = currentElement.textContent

    const combinedText = previousText + currentText
    previousElement.textContent = combinedText

    elementFactory.recycle(currentElement)

    previousElement.style.width = (fontWidthInPixels * combinedText.length) + "px"

    const updatedSpan = {
        startX: previousSpan.startX,
        endX: currentSpan.endX,
        element: previousElement,
        backgroundColor: previousSpan.backgroundColor,
        foregroundColor: previousSpan.foregroundColor,
    }

    // TODO: Test this
    grid.setRegion(previousSpan.startX, y, currentSpan.endX - previousSpan.startX, 1, updatedSpan)
}

export function getSpansToEdit(grid: Grid<ISpanElementInfo>, cells: IDeltaCellPosition[], elementFactory: IElementFactory): Map<number, ISpan[]> {
    const rowToSpans = new Map<number, ISpan[]>()
    cells.forEach((cell) => {
        const {x, y} = cell

        const info = grid.getCell(x, y)
        const currentRow = rowToSpans.get(y) || []

        if (!info) {
            rowToSpans.set(y, addOrCoalesceSpan(currentRow, {
                startX: x,
                endX: x + 1,
            }))
        } else {
            rowToSpans.set(y, addOrCoalesceSpan(currentRow, {
                startX: info.startX,
                endX: info.endX,
            }))

            if (info.element) {
                elementFactory.recycle(info.element)
                // info.element.textContent = ""
                // info.element.className = "deleted"
            }

            grid.setRegion(info.startX, y, info.endX - info.startX, 1, null)
        }
    })
    return rowToSpans
}
