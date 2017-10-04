/**
 * Interface that describes an Editor -
 * an editor handles rendering and input
 * for a specific window.
 */
export interface IEditor extends Oni.Editor {
    // Methods
    init(filesToOpen: string[]): Promise<void>
    render(): JSX.Element
}
