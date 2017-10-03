/**
 * QuickOpen.ts
 *
 * Manages the quick open menu
 */

import { spawn } from "child_process"
import { lstatSync } from "fs"

import * as glob from "glob"
import * as path from "path"
import * as Log from "./../Log"

import * as Config from "./../Config"
import { INeovimInstance } from "./../neovim"
import * as UI from "./../UI/index"
import { BufferUpdates } from "./BufferUpdates"

import { commandManager } from "./../Services/CommandManager"

export class QuickOpen {
    private _seenItems: string[] = []
    private _loadedItems: QuickOpenItem[] = []
    // private _loadedColors: QuickOpenItem[] = []
    private _neovimInstance: INeovimInstance
    private _bufferUpdates: BufferUpdates
    // private _doneLoadingColors: boolean
    // private _needToLoadColors: boolean

    constructor(neovimInstance: INeovimInstance, bufferUpdates: BufferUpdates) {
        this._neovimInstance = neovimInstance
        this._bufferUpdates = bufferUpdates
        // this._loadColors()

        UI.events.on("menu-item-selected:quickOpen", (selectedItem: any) => {
            const arg = selectedItem.selectedOption

            if (arg.icon === QuickOpenItem.convertTypeToIcon(QuickOpenType.loading)) {
                return
            } else if (arg.icon === QuickOpenItem.convertTypeToIcon(QuickOpenType.bookmarkHelp)) {
                commandManager.executeCommand("oni.config.openConfigJs")
            } else if (arg.icon === QuickOpenItem.convertTypeToIcon(QuickOpenType.color)) {
                neovimInstance.command(`colo ${arg.label}`)
            } else if (arg.icon === QuickOpenItem.convertTypeToIcon(QuickOpenType.folderHelp)) {
                commandManager.executeCommand("oni.openFolder")
            } else if (arg.icon === QuickOpenItem.convertTypeToIcon(QuickOpenType.bufferLine)) {
                if (selectedItem.openInSplit !== "e") {
                    neovimInstance.command(selectedItem.openInSplit + "!")
                }
                neovimInstance.command(`${arg.label}`)
            } else {
                let fullPath = path.join(arg.detail, arg.label)

                this._seenItems.push(fullPath)

                neovimInstance.command(selectedItem.openInSplit + "! " + fullPath)

                if (arg.icon === QuickOpenItem.convertTypeToIcon(QuickOpenType.folder)) {
                    neovimInstance.chdir(fullPath)
                }

                // If we are bookmark, and we open a file, the open it's dirname
                // If we are a directory, open it.
                if (arg.icon === QuickOpenItem.convertTypeToIcon(QuickOpenType.bookmark)) {
                    // If I use this one more place I'm going to make a function >.>
                    fullPath = fullPath.replace("~", process.env[(process.platform  === "win32") ? "USERPROFILE" : "HOME"])

                    if (lstatSync(fullPath).isDirectory()) {
                        neovimInstance.chdir(fullPath)
                    } else {
                        neovimInstance.chdir(arg.detail)
                    }
                }
            }
        })
    }

    // public async showColors() {
    //     this._showLoading()
    //     if (this._doneLoadingColors) {
    //         this._showMenuFromQuickOpenItems(this._loadedColors)
    //     } else if (this._needToLoadColors) {
    //         this._loadColors()
    //     }
    // }

    // private async _loadColors() {
    //     this._needToLoadColors = true
    //     this._neovimInstance.eval(`map(split(globpath(&rtp, "colors/*.vim"), "\n"), "substitute(fnamemodify(v:val, ':t'), '\\..\\{-}$', '', '')")`)
    //         .then((colors) => {
    //             colors.forEach( (d: string) => {
    //                 d = d.substring(0, d.length - 4)
    //                 this._loadedColors.push(new QuickOpenItem(d, QuickOpenType.color))
    //                 this._doneLoadingColors = true
    //                 if (UI.Selectors.isPopupMenuOpen()) {
    //                     this._showMenuFromQuickOpenItems(this._loadedColors)
    //                 }
    //             })
    //         })
    // }
    public async show() {
        // reset list and show loading indicator
        this._loadedItems = []
        this._showLoading()

        const config = Config.instance()
        const overriddenCommand = config.getValue("editor.quickOpen.execCommand")
        // const exclude = config.getValue("oni.exclude")

        //  If in exec directory or home, show bookmarks to change cwd to
        if (this._isInstallDirectoryOrHome()) {
            this._loadDefaultMenuItems()

            // TODO consider adding folders as well (recursive async with ignores/excludes)
            // For now, sync call bookmarks and open folder, it's so few it's not going to matter
            await this._showMenuFromQuickOpenItems(this._loadedItems)
            return
        }

        // Overridden strategy
        if (overriddenCommand) {
            // replace placeholder ${search} with "" for initial case
            this.loadMenu(overriddenCommand.replace("${search}", "")) // tslint:disable-line no-invalid-template-strings
            return
        }

        // Default strategy
        // The '-z' argument is needed to prevent escaping, see #711 for more information.
        this.loadMenu("git", ["ls-files", "--others", "--exclude-standard", "--cached", "-z"], "\u0000")
    }

    public async showBufferLines() {
        this._showLoading()
        let nu = 0

        const options = this._bufferUpdates.lines.map((line: string) => {
            return {
                icon: QuickOpenItem.convertTypeToIcon(QuickOpenType.bufferLine),
                label: String(++nu),
                detail: line,
                // I don't think I want to pin these... pinned: false,
            }
        })

        UI.Actions.showPopupMenu("quickOpen", options)
    }

    // Overridden strategy
    // If git repo, use git ls-files
    private async loadMenu(command: string, args: string[] = [], splitCharacter: string = "\n") {
        const filer = spawn(command, args)
        filer.stdout.on("data", (data) => {
            data.toString().split(splitCharacter).forEach((d: string) => {
                this._loadedItems.push(new QuickOpenItem(d, QuickOpenType.file))
            })
            this._showMenuFromQuickOpenItems(this._loadedItems)
        })
        // Otherwise, find all files recursively
        filer.stderr.on("data", (data) => {
            this._showLoading()
            Log.error(data.toString())

            // FIXME : Convert to an async function like the ones above.
            // TODO: This async call is being dropped, if we happen to use the promise
            return glob("**/*", {
                nodir: true,
                ignore: Config.instance().getValue("oni.exclude"),
            }, (_err: any, files: string[]) => {
                Log.error(_err)
                if (!files) {
                    this._loadDefaultMenuItems()
                    this._showMenuFromQuickOpenItems(this._loadedItems)
                } else {

                    files.forEach((f: string) => {
                        this._loadedItems.push(new QuickOpenItem(f, QuickOpenType.file))
                    })
                    this._showMenuFromQuickOpenItems(this._loadedItems)
                }
            })
        })

        filer.on("exit", (code) => {
            // For the (rare) case of an empty git directory
            if (code === 0 && this._loadedItems.length === 0) {
                this._loadDefaultMenuItems()
                this._showMenuFromQuickOpenItems(this._loadedItems)
            }
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
            const file = path.basename(f)
            const folder = path.dirname(f)

            return {
                icon: qitem.icon,
                label: file,
                detail: folder,
                pinned: this._seenItems.indexOf(f) >= 0,
            }
        })

        UI.Actions.showPopupMenu("quickOpen", options)
    }

    private _showLoading(): void {
        UI.Actions.showPopupMenu("quickOpen", [{
            icon: QuickOpenItem.convertTypeToIcon(QuickOpenType.loading),
            label: "Loading ...",
            detail: "",
            pinned: false,
        }])
    }

    private _loadDefaultMenuItems() {
        // Open folder help at top
        this._loadedItems.push(new QuickOpenItem(
            "Open Folder",
            QuickOpenType.folderHelp,
        ))

        // Get bookmarks, if we added remove them all so we don't think we have length
        const bookmarks = Config.instance().getValue("oni.bookmarks")
        let type = QuickOpenType.bookmark

        // If bookmarks are null show a help message and open config on selection
        // If we are length 0 this is because we haven't added help and we have no bookmarks
        // Once we add help, we now have 1
        if (bookmarks.length === 0) {
            type = QuickOpenType.bookmarkHelp
            bookmarks.push("Opens Configuration to add a bookmark/Add Bookmark")
        }

        // Either way we need to map to quick open item
        bookmarks.forEach((f: string) => {
            this._loadedItems.push(new QuickOpenItem(f, type))
        })

        // reset bookmarks because javascript doesn't respect local garbace collection IF
        // we are help, otherwise... don't... "optimize" >.>... sure
        if (type === QuickOpenType.bookmarkHelp) {
            bookmarks.splice(0, bookmarks.length)
        }
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
    bufferLine,
    loading,
    color,
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
            case QuickOpenType.bufferLine:
                return "angle-right"
            case QuickOpenType.loading:
                return "refresh fa-spin fa-fw"
            case QuickOpenType.color:
                return "paint-brush"
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
