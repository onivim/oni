/**
 * QuickOpen.ts
 *
 * Manages the quick open menu
 */

import { spawn } from "child_process"
import { lstat, readdir, lstatSync, readFileSync } from "fs"

const ignore = require('ignore')
import * as path from "path"
import * as Log from "./../Log"

import { MenuItem } from "../UI/components/Menu"
import * as Config from "./../Config"
import { NeovimEditor } from "./../Editor/NeovimEditor"
import { INeovimInstance } from "./../neovim"
import * as UI from "./../UI/index"
import { BufferUpdates } from "./BufferUpdates"

export class QuickOpen {
    private _seenItems: string[] = []
    private _loadedItems: QuickOpenItem[] = []
    private _loadedColors: QuickOpenItem[] = []
    private _cachedBuffers: QuickOpenItem[] = []
    private _neovimInstance: INeovimInstance
    private _bufferUpdates: BufferUpdates
    private _ignore: any
    private _binaryExtension: string[] = [ "*.4", "*.7", "*.7z", "*.AAA", "*.DIC", "*.DLL", "*.Dll", "*.EXE", "*.Exe", "*.FIL", "*.LNK", "*.SYS", "*.XRS", "*.acm", "*.asi", "*.awk", "*.ax", "*.cdl", "*.cgi", "*.com", "*.cpl", "*.d", "*.dLL", "*.dat", "*.dic", "*.dll", "*.drv", "*.ds", "*.e32", "*.efi", "*.exe", "*.flt", "*.fon", "*.foo", "*.gnu", "*.iec", "*.ime", "*.in", "*.js", "*.js~", "*.lex", "*.lnk", "*.ml", "*.mod", "*.mui", "*.nak", "*.nfs", "*.ocx", "*.odf", "*.olb", "*.old", "*.pl", "*.pm", "*.py", "*.pyd", "*.pyw", "*.rb", "*.rll", "*.rs", "*.scr", "*.sed", "*.sfx", "*.sh", "*.so", "*.sub", "*.sys", "*.t32", "*.t64", "*.tcl", "*.tlb", "*.tmp", "*.tpl", "*.tsp", "*.txt", "*.vdm", "*.ver", "*.zsh", ]

    constructor(neovimInstance: INeovimInstance, neovimEditor: NeovimEditor, bufferUpdates: BufferUpdates) {
        this._neovimInstance = neovimInstance
        this._bufferUpdates = bufferUpdates

        const config = Config.instance()
        // respect global ~/.gitignore, oniconfig/.oniignore
        // TODO make a .oniignore
        // TODO take out .gitignore in current directory unless this is ideal for some people.
        let ig = config.getValue("oni.ignore").join("\n")
        ig += this._binaryExtension.join("\n")
        let g = "~/.gitignore".replace("~", process.env[(process.platform  === "win32") ? "USERPROFILE" : "HOME"])
        if (lstatSync(g).isFile()) {
            ig += readFileSync(g).toString()
        }

        if ( "jojosaysdoit" === "jojosaysdoit" ) {
            ig += readFileSync(".gitignore").toString()
        }

        this._ignore = ignore().add(ig)

        UI.events.on("menu-item-selected:quickOpen", (selectedItem: any) => {
            const arg = selectedItem.selectedOption

            if (arg.icon === QuickOpenItem.convertTypeToIcon(QuickOpenType.loading)) {
                return
            } else if (arg.icon === QuickOpenItem.convertTypeToIcon(QuickOpenType.bookmarkHelp)) {
                neovimEditor.executeCommand("oni.config.openConfigJs")
            } else if (arg.icon === QuickOpenItem.convertTypeToIcon(QuickOpenType.color)) {
                neovimInstance.command(`colo ${arg.label}`)
            } else if (arg.icon === QuickOpenItem.convertTypeToIcon(QuickOpenType.folderHelp)) {
                neovimEditor.executeCommand("oni.openFolder")
            } else if (arg.icon === QuickOpenItem.convertTypeToIcon(QuickOpenType.bufferLine)) {
                if (selectedItem.openInSplit !== "e") {
                    neovimInstance.command(selectedItem.openInSplit + "!")
                }
                neovimInstance.command(`${arg.label}`)
            } else {
                let fullPath = path.join(arg.detail, arg.label)

                if (arg.icon === QuickOpenItem.convertTypeToIcon(QuickOpenType.file)) {
                    const incs = MenuItem.incrementedItems
                    let openThis = ""
                    incs.forEach((f: string) => {
                        this._seenItems.push(f)
                        openThis += "e! " + f + " | "
                    })
                    neovimInstance.command(openThis)
                }

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

    public async showColors() {
        this._loadedColors = []
        this._showLoading()
        this._neovimInstance.eval(`map(split(globpath(&rtp, "colors/*.vim"), "\n"), "substitute(fnamemodify(v:val, ':t'), '\\..\\{-}$', '', '')")`)
        .then((colors) => {
            colors.forEach( (d: string) => {
                d = d.substring(0, d.length - 4)
                this._loadedColors.push(new QuickOpenItem(d, QuickOpenType.color))
            })
            this._showMenuFromQuickOpenItems(this._loadedColors)
        })
    }

    public async show(forceBookmark: boolean = false) {
        // reset list, reset increments and show loading indicator
        this._loadedItems = []
        this._showLoading()
        this._loadManual(process.cwd())

        const config = Config.instance()
        // const exclude = config.getValue("oni.exclude")

        //  If in exec directory or home, show bookmarks to change cwd to
        if (this._isInstallDirectoryOrHome() || forceBookmark) {
            // Open folder help at top
            this._loadedItems.push(new QuickOpenItem(
                "Open Folder",
                QuickOpenType.folderHelp,
            ))

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

            // TODO consider adding folders as well (recursive async with ignores/excludes)
            // For now, sync call bookmarks and open folder, it's so few it's not going to matter
            await this._showMenuFromQuickOpenItems(this._loadedItems)
            return
        }

        // for testing purposes, I want to use my method.
        if ("jojooverride" === "jojooverride") {
            return
        }

        const overriddenCommand = config.getValue("editor.quickOpen.execCommand")
        // Overridden strategy
        if (overriddenCommand) {
            // replace placeholder ${search} with "" for initial case
            this._loadMenu(overriddenCommand.replace("${search}", ""))
            return
        }

        // Default strategy
        this._loadMenu("git", ["ls-files", "--others", "--exclude-standard", "--cached"])
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

    public async showBuffers() {
        this._showLoading()
        this._showMenuFromQuickOpenItems(this._cachedBuffers)
    }

    // Overridden strategy
    // If git repo, use git ls-files
    private async _loadMenu (command: string, args: string[] = []) {
        const filer = spawn(command, args)

        // consult the user ignore
        filer.stdout.on("data", (data) => {
            this._ignore.filter(data.toString()).split("\n").forEach( (d: string) => {
                this._loadedItems.push(new QuickOpenItem(d, QuickOpenType.file))
            })
            this._showMenuFromQuickOpenItems(this._loadedItems)
        })

        // Otherwise, find all files recursively
        filer.stderr.on("data", (data) => {
            this._showLoading()

            Log.error(data.toString())

            // send of manual loading
            this._loadManual(process.cwd())
        })
    }

    // manually load files >.> todo, recache fuse when load a new batch
    // TODO fix fuse for async, files load and it shows in menu BUT, it doesn't matter
    // because the input field won't let you type, will NEED to fix this..
    // ALSO have an exit flag, if the user says GOODBYE with esc, do NOT keep loading files
    private async _loadManual(dir: string) {
        const dathis = this

        lstat(dir, function (err, stat) {
            if (err !== null) {
                return
            }

            if (stat.isDirectory()) {
                readdir(dir, function (err, files) {
                    files.forEach( (fi: string) => {
                        let full = path.join(dir,fi)
                        let rela = path.join(dir.replace(process.cwd(), "."), fi)
                        if (!dathis._ignore.ignores(rela)) {
                            if(lstatSync(full).isFile()) {
                                console.log(rela)
                                dathis._loadedItems.push(new QuickOpenItem(rela, QuickOpenType.file))
                            }
                            else if (lstatSync(full).isDirectory()) {
                                dathis._loadManual(full)
                            }
                        }
                    })
                    // load after we read a directory, don't load for EACH file.
                    dathis._showMenuFromQuickOpenItems(dathis._loadedItems)
                });
            }
        });
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

}

// We use basename/dirname for label/detail
// So let's say you want the label YO with detail a greeting
// you would make file = "a greeting/YO"
export enum QuickOpenType {
    bookmark,
    bookmarkHelp,
    file,
    folder,
    folderHelp,
    bufferLine,
    buffer,
    loading,
    color,
}

// Wrapper around quick open items, this not only allows us to show multiple icons
// It also allows us to distinguish what happens once we know their icon
export class QuickOpenItem {
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
            case QuickOpenType.buffer:
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
