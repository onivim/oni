/**
 * QuickOpen.ts
 *
 * Manages the quick open menu
 */
import * as path from "path";

import * as UI from "./../UI/index"

import { execSync } from "child_process"
import { INeovimInstance } from "./../NeovimInstance"

export class QuickOpen {

    private _seenItems = [];

    constructor(neovimInstance: INeovimInstance) {
        UI.events.on("menu-item-selected", (arg) => {
            const fullPath = path.join(arg.detail, arg.label)

            this._seenItems.push(fullPath)
            neovimInstance.command("e! " + fullPath)
        })

    }

    public show(): void {

        const files = execSync("git ls-files").toString("utf8").split("\n")

        const options = files.map(f => {
            const file = path.basename(f)
            const folder = path.dirname(f)
            const fullPath = path.join(folder, file)
            return {
                icon: "file-text-o",
                label: file,
                detail: folder,
                pinned: this._seenItems.indexOf(fullPath) >= 0
            }
        })

        UI.showPopupMenu("quickOpen", options)
    }

}

