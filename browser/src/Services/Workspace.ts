/**
 * Workspace.ts
 *
 * The 'workspace' is responsible for managing the state of the current project:
 *  - The current / active directory (and 'Open Folder')
 */

import { Event, IEvent } from "./../Event"

export class Workspace implements Oni.Workspace {
    private _onDirectoryChangedEvent = new Event<string>()

    public get onDirectoryChanged(): IEvent<string> {
        return this._onDirectoryChangedEvent
    }

    public changeDirectory(newDirectory: string) {
        process.chdir(newDirectory)
        this._onDirectoryChangedEvent.dispatch(newDirectory)
    }
}

export const workspace = new Workspace()
