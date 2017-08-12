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
import { IBuffer, INeovimInstance } from "./../neovim"
import * as UI from "./../UI/index"

export class QuickOpen {
    private _seenItems: string[] = []
    private _loadedItems: QuickOpenItem[] = []
    private _cachedBufferLines: QuickOpenItem[] = []
    private _neovimInstance: INeovimInstance

    constructor(neovimInstance: INeovimInstance, neovimEditor: NeovimEditor) {
        this._neovimInstance = neovimInstance

        UI.events.on("menu-item-selected:quickOpen", (selectedItem: any) => {
            // If we are info it means we need to open the config
            // else If we are folder help, show open folder
            // else we are file/folder/bookmark so open it
            //      If we are bookmark or folder, change dir too
            const arg = selectedItem.selectedOption

            if (arg.icon === QuickOpenItem.convertTypeToIcon(QuickOpenType.bookmarkHelp)) {
                neovimEditor.executeCommand("oni.config.openConfigJs")
            } else if (arg.icon === QuickOpenItem.convertTypeToIcon(QuickOpenType.folderHelp)) {
                neovimEditor.executeCommand("oni.openFolder")
            } else if (arg.icon === QuickOpenItem.convertTypeToIcon(QuickOpenType.buffer)) {
                neovimInstance.command(`${arg.label}`)
            } else {
                const fullPath = path.join(arg.detail, arg.label)

                this._seenItems.push(fullPath)

                if (selectedItem.openInSplit === 0) {
                    neovimInstance.command("e! " + fullPath)
                } else if (selectedItem.openInSplit === 1) {
                    neovimInstance.command("vsp! " + fullPath)
                } else if (selectedItem.openInSplit === 2) {
                    neovimInstance.command("sp! " + fullPath)
                }

                if (arg.icon === QuickOpenItem.convertTypeToIcon(QuickOpenType.bookmark) ||
                    arg.icon === QuickOpenItem.convertTypeToIcon(QuickOpenType.folder)) {
                    neovimInstance.chdir(fullPath)
                }
            }
        })
    }

    public async show() {
        // reset list
        this._loadedItems.splice(0, this._loadedItems.length)

        const config = Config.instance()
        const overriddenCommand = config.getValue("editor.quickOpen.execCommand")
        // const exclude = config.getValue("oni.exclude")

        //  If in exec directory or home, show bookmarks to change cwd to
        if (this._isInstallDirectoryOrHome()) {
            // Get bookmarks, if we added remove them all so we don't think we have length
            const bookmarks = config.getValue("oni.bookmarks")
            let type = QuickOpenType.bookmark

            // If bookmarks are null show a help message and open config on selection
            // If we are length 0 this is because we haven't added help and we have no bookmarks
            // Once we add help, we now have 1
            if (bookmarks.length === 0 ) {
                type = QuickOpenType.bookmarkHelp
                bookmarks.push("Opens Configuration to add a bookmark/Add Bookmark")
            }

            // Either way we need to map to quick open item
            bookmarks.forEach( ( f: string) => {
                this._loadedItems.push(new QuickOpenItem(f, type))
            })

            // reset bookmarks because javascript doesn't respect local garbace collection IF
            // we are help, otherwise... don't... "optimize" >.>... sure
            if (type === QuickOpenType.bookmarkHelp) {
                bookmarks.splice(0, bookmarks.length)
            }

            // Open folder help
            this._loadedItems.push(new QuickOpenItem(
                "Open Folder",
                QuickOpenType.folderHelp,
            ))

            // TODO consider adding folders as well (recursive async with ignores/excludes)
            // For now, sync call bookmarks and open folder, it's so few it's not going to matter
            await this._showMenuFromQuickOpenItems(this._loadedItems)
            return
        }

        // Overridden strategy
        if (overriddenCommand) {
            // replace placeholder ${search} with "" for initial case
            this.loadMenu(overriddenCommand.replace("${search}", ""))
            return
        }

        // Default strategy
        this.loadMenu("git", ["ls-files", "--others", "--exclude-standard", "--cached"])
    }

    public async showBufferLines() {
        this._showMenuFromQuickOpenItems(this._cachedBufferLines)
    }

    public async cacheLines() {
        this._cachedBufferLines.splice(0, this._cachedBufferLines.length)

        let currentBuffer: IBuffer
        let lineCount: number
        let lineNu: number = 0
        this._neovimInstance.getCurrentBuffer()
            // get current buffer
            .then((buffer) => currentBuffer = buffer)

            // get line count
            .then(() => currentBuffer.getLineCount())
            .then((lc) => lineCount = lc)

            // get all the line
            .then(() => currentBuffer.getLines(0, lineCount, true) )
            .then((lines) => lines.forEach(
                (l: string) => {
                    lineNu++
                    if (l.length !== 0) {
                        this._cachedBufferLines.push(new QuickOpenItem(l, QuickOpenType.buffer, lineNu))
                        if (UI.Selectors.isPopupMenuOpen()) {
                            this.showBufferLines()
                        }
                    }
                },
            ))

    }

    // Overridden strategy
    // If git repo, use git ls-files
    private async loadMenu (command: string, args: string[] = []) {
        const filer = spawn(command, args)

        filer.stdout.on("data", (data) => {
            data.toString().split("\n").forEach( (d: string) => {
                this._loadedItems.push(new QuickOpenItem(d, QuickOpenType.file))
            })
            this._showMenuFromQuickOpenItems(this._loadedItems)
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
                files.forEach( (f: string) => {
                    this._loadedItems.push(new QuickOpenItem(f, QuickOpenType.file))
                })
                this._showMenuFromQuickOpenItems(this._loadedItems)
            })
        })
    }

    // If we are in home or install dir offer to open folder/bookmark (Basically user hasn't opened a folder yet)
    private _isInstallDirectoryOrHome() {
        return path.dirname(process.execPath) === process.cwd() ||
               process.env[(process.platform  === "win32") ? "USERPROFILE" : "HOME"] === process.cwd()
    }

    // Show menu based on items given
    private _showMenuFromQuickOpenItems(items: QuickOpenItem[]): void {
        const options = items.map((qitem) => {
            const f = qitem.item.trim()
            let file = path.basename(f)
            let folder = path.dirname(f)

            // if we are of type somthing with a lineNu, we want it to be focused
            if (qitem.lineNu !== undefined) {
                folder = file
                file = "" + qitem.lineNu
            }

            return {
                icon: qitem.icon,
                label: file,
                detail: folder,
                pinned: this._seenItems.indexOf(f) >= 0,
            }
        })

        UI.Actions.showPopupMenu("quickOpen", options)
    }

}

// We use basename/dirname for label/detail
// So let's say you want the label YO with detail a greeting
// you would make file = "a greeting/YO"
enum QuickOpenType {
    bookmark,
    bookmarkHelp,
    file,
    folder,
    folderHelp,
    buffer,
}

// Wrapper around quick open items, this not only allows us to show multiple icons
// It also allows us to distinguish what happens once we know their icon
class QuickOpenItem {
    // We take a type, and then give an fa icon
    public static convertTypeToIcon(type: QuickOpenType): string {
        switch (type) {
            case QuickOpenType.bookmark:
                return "star-o"
            case QuickOpenType.bookmarkHelp:
                return "info"
            case QuickOpenType.file:
                return "file-text-o"
            case QuickOpenType.folder:
                return "folder-o"
            case QuickOpenType.folderHelp:
                return "folder-open-o"
            case QuickOpenType.buffer:
                return "angle-right"
            default:
                return "question-circle-o"
        }
    }

    // Each has an item, and an icon
    private _item: string
    private _icon: string
    private _lineNu: number

    public get item(): string {
        return this._item
    }

    public get icon(): string {
        return this._icon
    }

    public get lineNu(): number {
        return this._lineNu
    }

    constructor(item: string, type: QuickOpenType, num?: number) {
        this._item = item
        this._icon = QuickOpenItem.convertTypeToIcon(type)
        this._lineNu = num
    }
}