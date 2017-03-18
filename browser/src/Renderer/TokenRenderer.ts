import { ICell, IScreen } from "./../Screen"

import { IElementFactory } from "./ElementFactory"

// TODO: Look at scroll perf

export interface ITokenRenderer {
    x: number
    y: number
    width: number
    backgroundColor: string | undefined
    foregroundColor: string | undefined
    canCombine: boolean

    canHandleCell(cell: ICell): boolean
    appendCell(cell: ICell): void
    getTag(): HTMLElement | null
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

    public get canCombine(): boolean {
        return true
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

        this._width += cell.characterWidth
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
        return super.canHandleCell(cell) && !isWhiteSpace(cell) && cell.characterWidth === 1
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
        span.style.width = ((this.width) * this.screen.fontWidthInPixels) + "px"
        return span
    }

}

/**
 * Specialized renderer that renders a single instance of a multibyte-character
 * Currently, this makes the assumption that character width will always be `2` - if that is not true, it will need to be modified.
 */
export class MultibyteTokenRenderer extends BaseTokenRenderer implements ITokenRenderer {

    private _str: string = ""
    private _hasRendered: boolean = false

    public get canCombine(): boolean {
        return false
    }

    constructor(x: number, y: number, cell: ICell, screen: IScreen, elementFactory: IElementFactory) {
        super(x, y, cell, screen, elementFactory)
    }

    public canHandleCell(cell: ICell): boolean {
        return super.canHandleCell(cell) && !isWhiteSpace(cell) && cell.characterWidth !== 1 && !this._hasRendered
    }

    public appendCell(cell: ICell): void {
        super.appendCell(cell)

        if (cell.characterWidth > 1) {
            this._str += cell.character
        } else if (cell.characterWidth === 0) {
            this._hasRendered = true
        }
    }

    public getTag(): HTMLElement | null {
        const span = super.getDefaultTag()
        span.textContent = this._str
        span.style.width = ((this.width) * this.screen.fontWidthInPixels) + "px"
        return span
    }
}

export function getRendererForCell(x: number, y: number, cell: ICell, screen: IScreen, elementFactory: IElementFactory) {
    if (isWhiteSpace(cell)) {
        return new WhiteSpaceTokenRenderer(x, y, cell, screen, elementFactory)
    } else {

        if (cell.characterWidth === 1) {
            return new TokenRenderer(x, y, cell, screen, elementFactory)
        } else {
            return new MultibyteTokenRenderer(x, y, cell, screen, elementFactory)
        }
    }
}

export function isWhiteSpace(cell: ICell): boolean {
    const character = cell.character

    return cell.characterWidth === 1 && (character === " " || character === "" || character === "\t" || character === "\n")
}
