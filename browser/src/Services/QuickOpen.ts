/**
 * QuickOpen.ts
 *
 * Manages the quick open menu
 */

import { spawn } from "child_process"

import * as glob from "glob"
import * as path from "path"
import * as Log from "./../Log"

import * as Config from "./../Config"
import { NeovimEditor } from "./../Editor/NeovimEditor"
import { INeovimInstance } from "./../neovim"
import * as UI from "./../UI/index"

export class QuickOpen {
    private _seenItems: string[] = []
    private _loadedItems: string[] = []

    // TODO If we export the icon, change from arg.icon to whatever
    // Or have modes
    constructor(neovimInstance: INeovimInstance, neovimEditor: NeovimEditor) {
        UI.events.on("menu-item-selected:quickOpen", (selectedItem: any) => {
            const arg = selectedItem.selectedOption

            // If we are loading don't open this
            if (arg.icon === "refresh fa-spin fa-fw") {
                return
            } else if (arg.icon === "info") {
                // If we are info it means we need to open the config
                neovimEditor.executeCommand("oni.config.openConfigJs")
                return
            }

            const fullPath = path.join(arg.detail, arg.label)

            this._seenItems.push(fullPath)

            if (!selectedItem.openInSplit) {
                neovimInstance.command("e! " + fullPath)
            } else {
                neovimInstance.command("vsp! " + fullPath)
            }

            if (arg.icon === "chain") {
                neovimInstance.chdir(fullPath)
            }

        })
    }

    public async show() {
        this._loadedItems.splice(0, this._loadedItems.length - 1)

        const config = Config.instance()
        const overriddenCommand = config.getValue("editor.quickOpen.execCommand")
        // const exclude = config.getValue("oni.exclude")

        //  If in exec directory or home, show bookmarks to change cwd to
        if (this._isInstallDirectoryOrHome()) {
            const bookmarks = config.getValue("oni.bookmarks")
            let icon = "chain"
            const helpMessage = "No bookmarks yet! Select this to open config! (shows example)"
            let noPush = false

            // If bookmarks are null show a help message and open config on selection
            // If we have already pushed, don't push again
            // Disable lint to prevent duplicate ifs
            if (bookmarks.length === 0 || (noPush = bookmarks[0] === helpMessage)) { // tslint:disable-line no-conditional-assignment
                icon = "info"
                if (!noPush) {
                    bookmarks.push(helpMessage)
                }
            }
            this._showMenuFromFiles(bookmarks, icon)
            return
        }

        let icon = "file-text-o"

        // Overridden strategy
        if (overriddenCommand) {
            // replace placeholder ${search} with "" for initial case
            this.loadMenu(overriddenCommand.replace("${search}", ""), icon)
            return
        }

        // Default strategy
        this.loadMenu("git", icon, ["ls-files", "--others", "--exclude-standard", "--cached"])

    }

    // Overridden strategy
    // If git repo, use git ls-files
    private async loadMenu (command: string, icon: string, args: string[] = []) {
        const filer = spawn(command, args)

        filer.stdout.on("data", (data) => {
            data.toString().split("\n").forEach( (d: string) => {
                this._loadedItems.push(d)
            })

            this._showMenuFromFiles(this._loadedItems, icon)
        })

        // Otherwise, find all files recursively
        filer.stderr.on("data", (data) => {
            Log.error(data.toString())

            // FIXME : Convert to an async function like the ones above.
            // TODO: This async call is being dropped, if we happen to use the promise
            return glob("**/*", {
                nodir: true,
                ignore: Config.instance().getValue("oni.exclude"),
            }, (_err: any, files: string[]) => {
                this._showMenuFromFiles(files, icon)
            })
        })
    }

    private _isInstallDirectoryOrHome() {
        return path.dirname(process.execPath) === process.cwd() ||
               process.env[(process.platform  === "win32") ? "USERPROFILE" : "HOME"] === process.cwd()
    }

    // Show menu based on files given
    private _showMenuFromFiles(files: string[], icon: string): void {
        const options = files.map((untrimmedFile) => {
            const f = untrimmedFile.trim()
            const file = path.basename(f)
            const folder = path.dirname(f)
            const fullPath = path.join(folder, file)

            return {
                icon,
                label: file,
                detail: folder,
                pinned: this._seenItems.indexOf(fullPath) >= 0,
            }
        })

        UI.Actions.showPopupMenu("quickOpen", options)
    }
}