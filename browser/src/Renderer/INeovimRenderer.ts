import { IScreen } from "./../neovim"

export interface IPosition {
    x: number
    y: number
}

export interface INeovimRenderer {
    start(element: HTMLElement): void

    redrawAll(screenInfo: IScreen): void

    draw(screenInfo: IScreen): void

    onAction(action: any): void
}
