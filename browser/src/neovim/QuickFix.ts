import * as Q from "q"

import { INeovimInstance } from "../NeovimInstance"

export type Action = "a" | " "

export interface IQuickListEntry {
    filename: string
    lnum: number
    col: number
    text: string
}

export interface IQuickFixList {
    setqflist(list: IQuickListEntry[], title: string, action?: Action): Q.Promise<void>
}

export class QuickFixList implements IQuickFixList {
    private _neovimInstance: INeovimInstance

    constructor(neovimInstance: INeovimInstance) {
        this._neovimInstance = neovimInstance
    }

    public setqflist(list: IQuickListEntry[], title: string, action?: Action): Q.Promise<void> {
        action = action || " "
        return this._neovimInstance.callFunction("setqflist", [list, action, title])
    }
}
