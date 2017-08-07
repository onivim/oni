/**
 * QuickOpen.ts
 *
 * Manages the quick open menu
 */

import { execSync } from "child_process"
import * as path from "path"
import * as Log from "./../Log"

import * as glob from "glob"
import * as _ from "lodash"
import * as Q from "q"

import * as Config from "./../Config"
import { NeovimEditor } from "./../Editor/NeovimEditor"
import { INeovimInstance } from "./../neovim"
import * as PromiseHelper from "./../PromiseHelper"
import * as UI from "./../UI/index"
import * as Git from "./Git"

export class QuickOpen {
    private _seenItems: string[] = []

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

    public show(forceBookmark: boolean = false): void {
        const config = Config.instance()
        const overriddenCommand = config.getValue("editor.quickOpen.execCommand")
        const exclude = config.getValue("oni.exclude")

        UI.Actions.showPopupMenu("quickOpen", [{
            icon: "refresh fa-spin fa-fw",
            label: "Loading Files...",
            detail: "",
            pinned: false,
        }])

        //  If in exec directory or home, show bookmarks to change cwd to
        if (forceBookmark || this._isInstallDirectoryOrHome()) {
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

        // Overridden strategy
        if (overriddenCommand) {
            try {
                // replace placeholder ${search} with "" for initial case
                const files = execSync(overriddenCommand.replace("${search}", ""), { cwd: process.cwd() })
                    .toString("utf8")
                    .split("\n")
                this._showMenuFromFiles(files, "file-text-o")
                return
            } catch (e) {
                Log.warn(`'${overriddenCommand}' returned an error: ${e.message}\nUsing default file list`)
            }
        }

        // Default strategy
        //  Otherwise, If git repo, use git ls-files
        //  Otherwise, find all files recursively
        const openPromise = Git.isGitRepository()
            .then((isGit) => {
                if (isGit) {
                    return Q.all([Git.getTrackedFiles(), Git.getUntrackedFiles(exclude)])
                        .then((values: [string[], string[]]) => {
                            const allFiles = _.flatten(values)
                            this._showMenuFromFiles(allFiles, "file-text-o")
                        })
                } else {
                    // TODO: This async call is being dropped, if we happen to use the promise
                    return glob("**/*", {
                        nodir: true,
                        ignore: exclude,
                    }, (_err: any, files: string[]) => {
                        this._showMenuFromFiles(files, "file-text-o")
                    })
                }
            })

        PromiseHelper.wrapPromiseAndNotifyError("editor.quickOpen.show", openPromise)
    }

    private _isInstallDirectoryOrHome() {
        return path.dirname(process.execPath) === process.cwd() ||
               process.env[(process.platform  === "win32") ? "USERPROFILE" : "HOME"] === process.cwd()
    }
    // Show menu based on files given
    // In some cases such as bookmarks we actually send a directory
    // Since opening in vim is the same essentially, this is nice.
    // TODO export icon instead of having it for EACH item...?
    // Will there ever be a case we show items of different icon type?
    // If not implement modes?
    // We can also use quick open to open folders once we implement that?
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
