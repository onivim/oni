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
import { INeovimInstance } from "./../neovim"
import * as PromiseHelper from "./../PromiseHelper"
import * as UI from "./../UI/index"
import * as Git from "./Git"

export class QuickOpen {
    private _seenItems: string[] = []

    constructor(neovimInstance: INeovimInstance) {
        UI.events.on("menu-item-selected:quickOpen", (selectedItem: any) => {
            const arg = selectedItem.selectedOption
            const fullPath = path.join(arg.detail, arg.label)

            this._seenItems.push(fullPath)

            if (!selectedItem.openInSplit) {
                neovimInstance.command("e! " + fullPath)
            } else {
                neovimInstance.command("vsp! " + fullPath)
            }
        })
    }

    public show(): void {
        const config = Config.instance()
        const overriddenCommand = config.getValue("editor.quickOpen.execCommand")
        const exclude = config.getValue("oni.exclude")

        UI.Actions.showPopupMenu("quickOpen", [{
            icon: "refresh fa-spin fa-fw",
            label: "Loading Files...",
            detail: "",
            pinned: false,
        }])

        // Overridden strategy
        if (overriddenCommand) {
            try {
                // replace placeholder ${search} with "" for initial case
                const files = execSync(overriddenCommand.replace("${search}", ""), { cwd: process.cwd() })
                    .toString("utf8")
                    .split("\n")
                this._showMenuFromFiles(files)
                return
            } catch (e) {
                Log.warn(`'${overriddenCommand}' returned an error: ${e.message}\nUsing default file list`)
            }
        }

        // Default strategy
        //  If git repo, use git ls-files
        //  Otherwise, find all files recursively
        const openPromise = Git.isGitRepository()
            .then((isGit) => {
                if (isGit) {
                    return Q.all([Git.getTrackedFiles(), Git.getUntrackedFiles(exclude)])
                        .then((values: [string[], string[]]) => {
                            const allFiles = _.flatten(values)
                            this._showMenuFromFiles(allFiles)
                        })
                } else {
                    // TODO: This async call is being dropped, if we happen to use the promise
                    return glob("**/*", {
                        nodir: true,
                        ignore: exclude,
                    }, (_err: any, files: string[]) => {
                        this._showMenuFromFiles(files)
                    })
                }
            })

        PromiseHelper.wrapPromiseAndNotifyError("editor.quickOpen.show", openPromise)
    }

    private _showMenuFromFiles(files: string[]): void {
        const options = files.map((untrimmedFile) => {
            const f = untrimmedFile.trim()
            const file = path.basename(f)
            const folder = path.dirname(f)
            const fullPath = path.join(folder, file)
            return {
                icon: "file-text-o",
                label: file,
                detail: folder,
                pinned: this._seenItems.indexOf(fullPath) >= 0,
            }
        })
        UI.Actions.showPopupMenu("quickOpen", options)
    }
}
