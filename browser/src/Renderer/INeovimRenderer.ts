import { IScreen } from "./../Screen"

export interface IPosition {
    x: number
    y: number
}

export interface INeovimRenderer {
    start(element: HTMLElement): void

    redrawAll(screenInfo: IScreen): void

    draw(screenInfo: IScreen, cells: IPosition[]): void

    onAction(action: any): void
}
