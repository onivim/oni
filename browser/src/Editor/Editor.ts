/**
 * Interface that describes an Editor -
 * an editor handles rendering and input
 * for a specific window.
 */
export interface IEditor {

    // Methods
    init(filesToOpen: string[]): void
    render(): JSX.Element
}
