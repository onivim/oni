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

import { IEvent, Event } from "./../Event"

import { INeovimInstance } from "./../neovim"
import { BufferUpdates } from "./BufferUpdates"

import { commandManager } from "./../Services/CommandManager"
import { configuration } from "./../Services/Configuration"
import { Menu, menuManager } from "./../Services/Menu"

import { spawn, ChildProcess } from 'child_process'

export class FinderProcess {

    private _process: ChildProcess

    private _isExplicitlyStopped: boolean = false

    private _onData = new Event<string[]>()
    private _onError = new Event<string>()
    private _onComplete = new Event<void>()


    public get onData(): IEvent<string[]> {
        return this._onData
    }

    constructor(private _command: string,
               private _args: string[],
               private _splitCharacter: string) {
    }

    public start(): void {
        if (this._process) {
            return
        }

        this._process = spawn(this._command, this._args)
        this._process.stdout.on('data', (data) => {


            // TODO: Handle case with incomplete data

            console.log('Got data: ' + data.toString())

            const dataToSend = data.toString().split(this._splitCharacter)
            this._onData.dispatch(dataToSend)
        })

        this._process.stderr.on('data', (data) => {
            this._onError.dispatch(data.toString())
        })

        this._process.on('exit', (code) => {
            this._onComplete.dispatch()
        })
    }

    public stop(): void {
        this._isExplicitlyStopped = true
        this._process.kill()
    }
}

export class QuickOpen {
    private _finderProcess: FinderProcess
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

    private _onItemSelected(selectedOption: Oni.Menu.MenuOption): void {
        const arg = selectedOption

        if (arg.icon === QuickOpenItem.convertTypeToIcon(QuickOpenType.loading)) {
            return
        } else if (arg.icon === QuickOpenItem.convertTypeToIcon(QuickOpenType.bookmarkHelp)) {
            commandManager.executeCommand("oni.config.openConfigJs")
        } else if (arg.icon === QuickOpenItem.convertTypeToIcon(QuickOpenType.color)) {
            this._neovimInstance.command(`colo ${arg.label}`)
        } else if (arg.icon === QuickOpenItem.convertTypeToIcon(QuickOpenType.folderHelp)) {
            commandManager.executeCommand("oni.openFolder")
        } else if (arg.icon === QuickOpenItem.convertTypeToIcon(QuickOpenType.bufferLine)) {
            // TODO: Make sure this works!
            // if (selectedItem.openInSplit !== "e") {
            //     this._neovimInstance.command(selectedItem.openInSplit + "!")
            // }
            this._neovimInstance.command(`${arg.label}`)
        } else {
            let fullPath = path.join(arg.detail, arg.label)

            this._seenItems.push(fullPath)

            // TODO: Make sure this works!
            // this._neovimInstance.command(selectedItem.openInSplit + "! " + fullPath)
            this._neovimInstance.command("e! " + fullPath)

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
            // await this._setItemsFromQuickOpenItems(this._loadedItems)
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
    }

    // Overridden strategy
    // If git repo, use git ls-files
    private loadMenu(command: string, args: string[] = [], splitCharacter: string = "\n") {
        this._menu.show()

        this._menu.setLoading(true)
        this._loadedItems = []

        if (this._finderProcess) {
            this._finderProcess.stop()
            this._finderProcess = null
        }

        this._finderProcess = new FinderProcess(command, args, splitCharacter)

        this._finderProcess.onData.subscribe((newData) => {
            const newItems = newData.map((s) => new QuickOpenItem(s, QuickOpenType.file))
            this._loadedItems = this._loadedItems.concat(newItems)
            this._setItemsFromQuickOpenItems(this._loadedItems)
        })

        this._finderProcess.start()

        // TODO: Handle oni.exclude
    }

    // If we are in home or install dir offer to open folder/bookmark (Basically user hasn't opened a folder yet)
    private _isInstallDirectoryOrHome() {
        return path.dirname(process.execPath) === process.cwd() ||
               process.env[(process.platform  === "win32") ? "USERPROFILE" : "HOME"] === process.cwd()
    }

    // Show menu based on items given
    private _setItemsFromQuickOpenItems(items: QuickOpenItem[]): void {
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
