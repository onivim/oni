import { IEvent } from "./../Event"

/**
 * Interface that describes an Editor -
 * an editor handles rendering and input
 * for a specific window.
 */
export interface IEditor {

    // Members
    mode: string

    // Events
    onModeChanged: IEvent<string>

    // Methods
    init(filesToOpen: string[]): void
    render(): JSX.Element
}
