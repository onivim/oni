/**
 * WindowTitle.ts
 *
 * Manages the window title
 */

import { INeovimInstance } from "./../NeovimInstance"

export class WindowTitle {

    constructor(neovimInstance: INeovimInstance) {
        neovimInstance.on("set-title", (title: string) => {
            document.title = title.replace(" - NVIM", " - ONI")
        })
    }
}
