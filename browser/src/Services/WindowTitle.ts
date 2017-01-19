/**
 * WindowTitle.ts
 *
 * Manages the window title
 */

import { INeovimInstance } from "./../NeovimInstance"
import { isWindows } from "./../Platform"

export class WindowTitle {

    constructor(neovimInstance: INeovimInstance) {
        neovimInstance.on("event", (name: string, context: any) => {
            if (name === "BufEnter") {
                let filename = context.bufferFullPath
                if ( ! filename) { // unnamed file
                    document.title = "ONI"
                    return
                }

                // use the format "file (path) - ONI" to match GVIM format
                let separator = isWindows() ? "\\" : "/"
                let i = filename.lastIndexOf(separator)
                if (i > -1) {
                    let path = filename.slice(0, i + 1)
                    filename = filename.slice(i + 1)
                    document.title = filename + " (" + path + ") - ONI"
                } else {
                    document.title = filename + " - ONI"
                }
            }
        })
    }
}
