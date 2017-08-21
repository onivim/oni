/**
 * WindowManager.ts
 * 
 * Responsible for managing state of the editor collection, and
 * switching between active editors.
 *
 * It also provides convenience methods for hooking events
 * to the active editor, and managing transitions between editors.
 */

import { Event, IEvent } from "./../Event"

import { IEditor } from "./../Editor/Editor"

export enum Split {
    Right = 0,
    Bottom = 1,
    Left = 2,
    Top = 3,
}

export enum SplitDirection {
    Horizontal = 0,
    Vertical = 1,
}

export type SplitOrLeaf = ISplitInfo | ISplitLeaf

export interface ISplitInfo {
    type: "Split"
    splits: SplitOrLeaf[]
    direction: SplitDirection
    parent: ISplitInfo
}

export interface ISplitLeaf {
    type: "Leaf"
    size: string
    editor: IEditor
}

const createSplitRoot = (direction: SplitDirection, parent?: ISplitInfo): ISplitInfo => ({
    type: "Split",
    splits: [],
    direction: SplitDirection.Horizontal,
    parent: parent || null
})



export class WindowManager {
    private _activeSplit: ISplitLeaf
    private _splitRoot: ISplitInfo

    private _onSplitChanged: IEvent<ISplitInfo> = new Event<ISplitInfo>()
    private _onFocusChanged: IEvent<IEditor> = new Event<IEditor>()

    public get onSplitChanged(): IEvent<ISplitInfo> {
        return this._onSplitChanged
    }

    public get onFocusChanged(): IEvent<IEditor> {
        return this._onFocusChanged
    }

    public get splitRoot(): ISplitInfo {
        return this._splitRoot
    }

    constructor() {
        this._splitRoot = createSplitRoot(SplitDirection.Horizontal)
        this._activeSplit = null
    }

    public split(direction: SplitDirection, newEditor: Oni.Editor, sourceEditor?: Oni.Editor) {

    }

    public moveLeft(): void {

    }

    public moveRight(): void {

    }

    public moveUp(): void {

    }

    public moveDown(): void {

    }

    public close(editor: Oni.Editor) {

    }
}

export const windowManager = new WindowManager()
