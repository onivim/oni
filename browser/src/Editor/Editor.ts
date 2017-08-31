import { IEvent } from "./../Event"

export interface IBufferEnteredEventInfo {
    fileName: string
    fileType: string
}

export interface IBufferChangedEventInfo {
    fileName: string
    contents: string[]
}

/**
 * Interface that describes an Editor -
 * an editor handles rendering and input
 * for a specific window.
 */
export interface IEditor {

    // Members
    mode: string

    // Events
    onBufferEntered: IEvent<IBufferEnteredEventInfo>
    onBufferChanged: IEvent<IBufferChangedEventInfo>
    onModeChanged: IEvent<string>

    // Methods
    init(filesToOpen: string[]): void
    render(): JSX.Element
}
