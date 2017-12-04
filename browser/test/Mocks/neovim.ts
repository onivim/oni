/**
 * Mocks/neovim.ts
 *
 * Implementations of test mocks and doubles,
 * for Neovim facing classes / interfaces.
 */

import * as Neovim from "./../../src/neovim"

export class MockScreen implements Neovim.IScreen {
    
    public get backgroundColor(): string {
        return null
    }

    public get currentBackgroundColor(): string {
        return null
    }

    public get currentForegroundColor(): string {
        return null
    }

    public get cursorColumn(): number { 
        return null
    }
    public get cursorRow(): number {
        return null
    }
    public get fontFamily(): null | string {
        return null
    }
    public get fontHeightInPixels(): number {
        return null
    }
    public get fontSize(): null | string {
        return null
    }
    public get fontWidthInPixels(): number {
        return null
    }
    public get foregroundColor(): string {
        return null
    }
    public get height(): number {
        return null
    }
    public get linePaddingInPixels(): number {
        return null
    }
    public get mode(): string {
        return "normal"
    }
    public get width(): number {
        return null
    }
    public dispatch(action: Neovim.IAction): void {
    
    }

    public getCell(x: number, y: number): Neovim.ICell {
         return null
    }

    public getScrollRegion(): Neovim.IScrollRegion {
        return null
    }
}
