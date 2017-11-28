/**
 * Interface that describes an Editor -
 * an editor handles rendering and input
 * for a specific window.
 */

import * as Oni from "oni-api"

export interface IEditor extends Oni.Editor {
    // Methods
    init(filesToOpen: string[]): void
    render(): JSX.Element
}
