/**
 * Interface that describes an Editor -
 * an editor handles rendering and input
 * for a specific window.
 */
export interface IEditor {

    init(args: any): void

    render(element: HTMLDivElement): void
}
