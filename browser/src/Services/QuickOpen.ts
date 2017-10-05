/**
 * QuickOpen.ts
 *
 * Manages the quick open menu
 */

// import { spawn } from "child_process"
import { lstatSync } from "fs"

// import * as glob from "glob"
import * as path from "path"
// import * as Log from "./../Log"

import { INeovimInstance } from "./../neovim"
import { BufferUpdates } from "./BufferUpdates"

import { commandManager } from "./../Services/CommandManager"
import { configuration } from "./../Services/Configuration"
import { Menu, menuManager } from "./../Services/Menu"

export class QuickOpen {
    private _seenItems: string[] = []
    private _loadedItems: QuickOpenItem[] = []
    private _neovimInstance: INeovimInstance
    private _bufferUpdates: BufferUpdates
    private _menu: Menu

    constructor(neovimInstance: INeovimInstance, bufferUpdates: BufferUpdates) {
        this._neovimInstance = neovimInstance
        this._bufferUpdates = bufferUpdates

        this._menu = menuManager.create()
        this._menu.onItemSelected.subscribe((selectedItem: any) => { this._onItemSelected(selectedItem) })
    }

    private _onItemSelected(selectedItem: any): void {
        const arg = selectedItem.selectedOption

        if (arg.icon === QuickOpenItem.convertTypeToIcon(QuickOpenType.loading)) {
            return
        } else if (arg.icon === QuickOpenItem.convertTypeToIcon(QuickOpenType.bookmarkHelp)) {
            commandManager.executeCommand("oni.config.openConfigJs")
        } else if (arg.icon === QuickOpenItem.convertTypeToIcon(QuickOpenType.color)) {
            this._neovimInstance.command(`colo ${arg.label}`)
        } else if (arg.icon === QuickOpenItem.convertTypeToIcon(QuickOpenType.folderHelp)) {
            commandManager.executeCommand("oni.openFolder")
        } else if (arg.icon === QuickOpenItem.convertTypeToIcon(QuickOpenType.bufferLine)) {
            if (selectedItem.openInSplit !== "e") {
                this._neovimInstance.command(selectedItem.openInSplit + "!")
            }
            this._neovimInstance.command(`${arg.label}`)
        } else {
            let fullPath = path.join(arg.detail, arg.label)

            this._seenItems.push(fullPath)

            this._neovimInstance.command(selectedItem.openInSplit + "! " + fullPath)

            if (arg.icon === QuickOpenItem.convertTypeToIcon(QuickOpenType.folder)) {
                this._neovimInstance.chdir(fullPath)
            }

            // If we are bookmark, and we open a file, the open it's dirname
            // If we are a directory, open it.
            if (arg.icon === QuickOpenItem.convertTypeToIcon(QuickOpenType.bookmark)) {
                // If I use this one more place I'm going to make a function >.>
                fullPath = fullPath.replace("~", process.env[(process.platform  === "win32") ? "USERPROFILE" : "HOME"])

                if (lstatSync(fullPath).isDirectory()) {
                    this._neovimInstance.chdir(fullPath)
                } else {
                    this._neovimInstance.chdir(arg.detail)
                }
            }
        }
    }

    public isOpen(): boolean {
        return false
    }

    public openFile(): void {
    }

    public openFileNewTab(): void {
    }

    public openFileHorizontal(): void {
    }

    public openFileVertical(): void {
    }

    public async show() {
        // reset list and show loading indicator
        this._loadedItems = []

        const overriddenCommand = configuration.getValue("editor.quickOpen.execCommand")
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
        let nu = 0

        const options = this._bufferUpdates.lines.map((line: string) => {
            return {
                icon: QuickOpenItem.convertTypeToIcon(QuickOpenType.bufferLine),
                label: String(++nu),
                detail: line,
                // I don't think I want to pin these... pinned: false,
            }
        })

        this._menu.show()
        this._menu.setItems(options)

        // UI.Actions.showPopupMenu("quickOpen", options)
    }

    // Overridden strategy
    // If git repo, use git ls-files
    private async loadMenu(command: string, args: string[] = [], splitCharacter: string = "\n") {

        // TODO:

        this._menu.show()
        // const filer = spawn(command, args)
        // filer.stdout.on("data", (data) => {
        //     data.toString().split(splitCharacter).forEach((d: string) => {
        //         this._loadedItems.push(new QuickOpenItem(d, QuickOpenType.file))
        //     })
        //     this._showMenuFromQuickOpenItems(this._loadedItems)
        // })
        // // Otherwise, find all files recursively
        // filer.stderr.on("data", (data) => {
        //     this._showLoading()
        //     Log.error(data.toString())

        //     // FIXME : Convert to an async function like the ones above.
        //     // TODO: This async call is being dropped, if we happen to use the promise
        //     return glob("**/*", {
        //         nodir: true,
        //         ignore: configuration.getValue("oni.exclude"),
        //     }, (_err: any, files: string[]) => {
        //         Log.error(_err)
        //         if (!files) {
        //             this._loadDefaultMenuItems()
        //             this._showMenuFromQuickOpenItems(this._loadedItems)
        //         } else {

        //             files.forEach((f: string) => {
        //                 this._loadedItems.push(new QuickOpenItem(f, QuickOpenType.file))
        //             })
        //             this._showMenuFromQuickOpenItems(this._loadedItems)
        //         }
        //     })
        // })

        // filer.on("exit", (code) => {
        //     // For the (rare) case of an empty git directory
        //     if (code === 0 && this._loadedItems.length === 0) {
        //         this._loadDefaultMenuItems()
        //         this._showMenuFromQuickOpenItems(this._loadedItems)
        //     }
        // })
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


        // TODO:
        // UI.Actions.showPopupMenu("quickOpen", options)

        this._menu.show()
        this._menu.setItems(options)
    }

    private _loadDefaultMenuItems() {
        // Open folder help at top
        this._loadedItems.push(new QuickOpenItem(
            "Open Folder",
            QuickOpenType.folderHelp,
        ))

        // Get bookmarks, if we added remove them all so we don't think we have length
        const bookmarks = configuration.getValue("oni.bookmarks")
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
