import * as os from "os"

import { app, BrowserWindow, dialog, Menu } from "electron"
import { createWindow, IDelayedEvent } from "./main"

export const buildDockMenu = (mainWindow, loadInit) => {
    const menu = []
    menu.push({
        label: "New Window",
        click() {
            createWindow([], process.cwd())
        },
    })

    return Menu.buildFromTemplate(menu)
}

export const buildMenu = (mainWindow, loadInit) => {
    const menu = []

    // On Windows, both the forward slash `/` and the backward slash `\` are accepted as path delimiters.
    // The node APIs only return the backward slash, ie: `C:\\oni\\README.md`, but this causes problems
    // for VIM as it sees escape keys.

    const executeMenuAction = (browserWindow: BrowserWindow, delayedEvent: IDelayedEvent) => {
        if (browserWindow) {
            return browserWindow.webContents.send(delayedEvent.evt, ...delayedEvent.cmd)
        }
        createWindow([], process.cwd(), delayedEvent)
    }

    const normalizePath = fileName => fileName.split("\\").join("/")

    const executeVimCommand = (browserWindow: BrowserWindow, command: string) => {
        executeMenuAction(browserWindow, {
            evt: "execute-command",
            cmd: ["editor.executeVimCommand", command],
        })
    }

    const openMultipleFiles = (browserWindow: BrowserWindow, files: string[]) => {
        executeMenuAction(browserWindow, { evt: "open-files", cmd: [files] })
    }

    const executeOniCommand = (browserWindow: BrowserWindow, command: string) => {
        executeMenuAction(browserWindow, { evt: "execute-command", cmd: [command] })
    }

    const openUrl = (browserWindow: BrowserWindow, url: string) => {
        executeMenuAction(browserWindow, { evt: "execute-command", cmd: ["browser.openUrl", url] })
    }

    const executeVimCommandForFiles = (browserWindow, command, files) => {
        if (!files || !files.length) {
            return
        }

        files.forEach(fileName =>
            executeVimCommand(browserWindow, `${command} ${normalizePath(fileName)}`),
        )
    }

    const isWindows = os.platform() === "win32"
    const isDarwin = os.platform() === "darwin"

    const preferences = {
        label: "Preferences",
        submenu: [
            {
                label: "Edit Oni config",
                accelerator: "CmdOrCtrl+,",
                click(item, focusedWindow) {
                    executeOniCommand(focusedWindow, "oni.config.openConfigJs")
                },
            },
        ],
    }

    if (loadInit) {
        preferences.submenu.push({
            label: "Edit Neovim config",
            accelerator: null,
            click(item, focusedWindow) {
                executeOniCommand(focusedWindow, "oni.config.openInitVim")
            },
        })
    }

    const reopenWithEncoding = {
        label: "Reopen with Encoding",
        submenu: [],
    }

    // TODO: Maybe better show normal encoding name in submenu?
    // Encoding list from http://vimdoc.sourceforge.net/htmldoc/mbyte.html#encoding-values
    const encodingList = [
        "utf-8",
        "utf-16le",
        "utf-16be",
        "utf-32le",
        "utf-32be",
        "latin1",
        "koi8-r",
        "koi8-u",
        "macroman",
        "cp437",
        "cp737",
        "cp775",
        "cp850",
        "cp852",
        "cp855",
        "cp857",
        "cp860",
        "cp861",
        "cp862",
        "cp863",
        "cp865",
        "cp866",
        "cp869",
        "cp874",
        "cp1250",
        "cp1251",
        "cp1253",
        "cp1254",
        "cp1255",
        "cp1256",
        "cp1257",
        "cp1258",
        "cp932",
        "euc-jp",
        "sjis",
        "cp949",
        "euc-kr",
        "cp936",
        "euc-cn",
        "cp950",
        "big5",
        "euc-tw",
    ].map(val => {
        return {
            label: val.toUpperCase(),
            click(item, focusedWindow) {
                executeVimCommand(focusedWindow, ":e! ++enc=" + val)
            },
        }
    })

    reopenWithEncoding.submenu.push(...encodingList)

    if (process.platform === "darwin") {
        menu.push({
            label: app.getName(),
            submenu: [
                {
                    label: "About " + app.getName(),
                    click(item, focusedWindow) {
                        executeOniCommand(focusedWindow, "oni.about")
                    },
                },
                { type: "separator" },
                preferences,
                { type: "separator" },
                { role: "services", submenu: [] },
                { type: "separator" },
                { role: "hide" },
                { role: "hideothers" },
                { role: "unhide" },
                { type: "separator" },
                { role: "quit" },
            ],
        })
    }
    menu.push({
        label: "File",
        submenu: [
            {
                label: "New File",
                accelerator: "CmdOrCtrl+N",
                click(item, focusedWindow) {
                    executeVimCommand(focusedWindow, ":enew")
                },
            },
            {
                label: "Open File…",
                accelerator: "CmdOrCtrl+O",
                click(item, focusedWindow) {
                    dialog.showOpenDialog(
                        focusedWindow,
                        { properties: ["openFile", "multiSelections"] },
                        files => openMultipleFiles(focusedWindow, files),
                    )
                },
            },
            {
                label: "Open Folder…",
                click(item, focusedWindow) {
                    executeOniCommand(focusedWindow, "workspace.openFolder")
                },
            },
            reopenWithEncoding,
            {
                label: "Split Open…",
                click(item, focusedWindow) {
                    dialog.showOpenDialog(focusedWindow, { properties: ["openFile"] }, files =>
                        executeVimCommandForFiles(focusedWindow, ":sp", files),
                    )
                },
            },
            {
                type: "separator",
            },
            {
                label: "New Window",
                click() {
                    createWindow([], process.cwd())
                },
            },
            {
                label: "Hide Window",
                click(item, focusedWindow) {
                    focusedWindow.hide()
                },
            },
            {
                type: "separator",
            },
            {
                label: "Save",
                click(item, focusedWindow) {
                    executeVimCommand(focusedWindow, ":w")
                },
            },
            {
                label: "Save As…",
                click(item, focusedWindow) {
                    dialog.showSaveDialog(focusedWindow, {}, name => {
                        if (name) {
                            executeVimCommand(focusedWindow, ":save " + normalizePath(name))
                        }
                    })
                },
            },
            {
                label: "Save All",
                click(item, focusedWindow) {
                    executeVimCommand(focusedWindow, ":wall")
                },
            },
            {
                type: "separator",
            },
            ...(isDarwin ? [] : [preferences, { type: "separator" }]),
            {
                label: "Close File",
                click(item, focusedWindow) {
                    executeVimCommand(focusedWindow, ":close")
                },
            },
            {
                label: "Revert File",
                click(item, focusedWindow) {
                    executeVimCommand(focusedWindow, ":e!")
                },
            },
            {
                label: "Close All File",
                click(item, focusedWindow) {
                    executeVimCommand(focusedWindow, ":%bw")
                },
            },
        ],
    })

    // Edit menu
    menu.push({
        label: "Edit",
        submenu: [
            {
                label: "Undo",
                click(item, focusedWindow) {
                    executeVimCommand(focusedWindow, "u")
                },
            },
            {
                label: "Redo",
                click(item, focusedWindow) {
                    executeVimCommand(focusedWindow, "\\<C-r>")
                },
            },
            {
                label: "Repeat",
                click(item, focusedWindow) {
                    executeVimCommand(focusedWindow, ".")
                },
            },
            {
                type: "separator",
            },
            {
                label: "Copy",
                click(item, focusedWindow) {
                    executeOniCommand(focusedWindow, "editor.clipboard.yank")
                },
            },
            {
                label: "Cut",
                click(item, focusedWindow) {
                    executeOniCommand(focusedWindow, "editor.clipboard.cut")
                },
            },
            {
                label: "Paste",
                click(item, focusedWindow) {
                    executeOniCommand(focusedWindow, "editor.clipboard.paste")
                },
            },
            {
                label: "Paste Line Before",
                click(item, focusedWindow) {
                    executeVimCommand(focusedWindow, "[p")
                },
            },
            {
                label: "Paste Line After",
                click(item, focusedWindow) {
                    executeVimCommand(focusedWindow, "]p")
                },
            },
            {
                label: "Copy File Path",
                submenu: [
                    {
                        label: "Full Path",
                        click(item, focusedWindow) {
                            executeVimCommand(
                                focusedWindow,
                                ":let @" + (isWindows ? "*" : "+") + "=expand('%:p')",
                            )
                        },
                    },
                    {
                        label: "Full Path with Line Number",
                        click(item, focusedWindow) {
                            executeVimCommand(
                                focusedWindow,
                                ":let @" +
                                    (isWindows ? "*" : "+") +
                                    "=expand('%:p') . ':' . line('.')",
                            )
                        },
                    },
                    {
                        label: "Relative Path",
                        click(item, focusedWindow) {
                            executeVimCommand(
                                focusedWindow,
                                ":let @" + (isWindows ? "*" : "+") + "=expand('%')",
                            )
                        },
                    },
                    {
                        label: "Relative Path with Line Number",
                        click(item, focusedWindow) {
                            executeVimCommand(
                                focusedWindow,
                                ":let @" +
                                    (isWindows ? "*" : "+") +
                                    "=expand('%') . ':' . line('.')",
                            )
                        },
                    },
                    {
                        label: "File Name",
                        click(item, focusedWindow) {
                            executeVimCommand(
                                focusedWindow,
                                ":let @" + (isWindows ? "*" : "+") + "=expand('%:t')",
                            )
                        },
                    },
                    {
                        label: "File Name with Line Number",
                        click(item, focusedWindow) {
                            executeVimCommand(
                                focusedWindow,
                                ":let @" +
                                    (isWindows ? "*" : "+") +
                                    "=expand('%:t') . ':' . line('.')",
                            )
                        },
                    },
                ],
            },
            {
                type: "separator",
            },
            {
                label: "Line",
                submenu: [
                    {
                        label: "Indent",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, ">")
                        },
                    },
                    {
                        label: "Unindent",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, "<")
                        },
                    },
                    {
                        label: "Reindent",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, "=i{")
                        },
                    },
                    {
                        type: "separator",
                    },
                    {
                        label: "Move Up",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, "m+")
                        },
                    },
                    {
                        label: "Move Down",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, "m--")
                        },
                    },
                    {
                        type: "separator",
                    },
                    {
                        label: "Duplicate",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, "Yp")
                        },
                    },
                    {
                        label: "Copy",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, "Y")
                        },
                    },
                    {
                        label: "Cut",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, "Y^D")
                        },
                    },
                    {
                        label: "Delete",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, "dd")
                        },
                    },
                    {
                        label: "Clear",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, "^D")
                        },
                    },
                    {
                        label: "Join",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, "J")
                        },
                    },
                ],
            },
            {
                label: "Text",
                submenu: [
                    {
                        label: "Upper Case",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, "U")
                        },
                    },
                    {
                        label: "Lower Case",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, "u")
                        },
                    },
                    {
                        label: "Swap Case",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, "~")
                        },
                    },
                    {
                        type: "separator",
                    },
                    {
                        label: "Delete Inner Word",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, "diw")
                        },
                    },
                    {
                        label: "Delete Previous Word",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, "bbdw")
                        },
                    },
                    {
                        label: "Delete Next Word",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, "nwdw")
                        },
                    },
                    {
                        label: "Strip First Character",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, ":%normal ^x")
                        },
                    },
                    {
                        label: "Strip Last Character",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, ":%normal $x")
                        },
                    },
                    {
                        label: "Strip Trailings Blanks",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, ":%s/^s+//")
                            executeVimCommand(focusedWindow, ":%s/s+$//")
                        },
                    },
                    {
                        label: "Delete Line",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, "dd")
                        },
                    },
                    {
                        label: "Remove Blank Lines",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, ":g/^$/d")
                        },
                    },
                ],
            },
            {
                label: "Comment",
                submenu: [
                    {
                        label: "Toggle Comment",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, ":Commentary")
                        },
                    },
                ],
            },
            {
                label: "Insert",
                submenu: [
                    {
                        label: "Encoding Identifier",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, ":put =&fileencoding")
                        },
                    },
                    {
                        type: "separator",
                    },
                    {
                        label: "Date / Time (Short)",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, ":put =strftime('%c')")
                        },
                    },
                    {
                        label: "Date / Time (Long)",
                        click(item, focusedWindow) {
                            executeVimCommand(
                                focusedWindow,
                                ":put =strftime('%a, %d %b %Y %H:%M:%S')",
                            )
                        },
                    },
                    {
                        type: "separator",
                    },
                    {
                        label: "Full Path",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, ":put =expand('%:p')")
                        },
                    },
                    {
                        label: "File Name",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, ":put =expand('%:t')")
                        },
                    },
                    {
                        label: "File Name with Line Number",
                        click(item, focusedWindow) {
                            executeVimCommand(
                                focusedWindow,
                                ":put =expand('%:t') . ':' . line('.')",
                            )
                        },
                    },
                ],
            },
            {
                type: "separator",
            },
            {
                label: "Select All",
                click(item, focusedWindow) {
                    executeVimCommand(focusedWindow, "ggVG")
                },
            },
        ],
    })

    // Window menu
    menu.push({
        label: "Split",
        submenu: [
            {
                label: "New Horizontal Split",
                click(item, focusedWindow) {
                    executeVimCommand(focusedWindow, "\\<C-w>n")
                },
            },
            {
                label: "Split File Horizontally",
                click(item, focusedWindow) {
                    executeVimCommand(focusedWindow, "\\<C-w>s")
                },
            },
            {
                label: "Split File Vertically",
                click(item, focusedWindow) {
                    executeVimCommand(focusedWindow, "\\<C-w>v")
                },
            },
            {
                type: "separator",
            },
            {
                label: "Close",
                click(item, focusedWindow) {
                    executeVimCommand(focusedWindow, "\\<C-w>c")
                },
            },
            {
                label: "Close Other Split(s)",
                click(item, focusedWindow) {
                    executeVimCommand(focusedWindow, "\\<C-w>o")
                },
            },
            {
                type: "separator",
            },
            {
                label: "Move To",
                submenu: [
                    {
                        label: "Top",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, "\\<C-w>K")
                        },
                    },
                    {
                        label: "Bottom",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, "\\<C-w>J")
                        },
                    },
                    {
                        label: "Left Side",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, "\\<C-w>H")
                        },
                    },
                    {
                        label: "Right Side",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, "\\<C-w>L")
                        },
                    },
                ],
            },
            {
                label: "Rotate Up",
                click(item, focusedWindow) {
                    executeVimCommand(focusedWindow, "\\<C-w>R")
                },
            },
            {
                label: "Rotate Down",
                click(item, focusedWindow) {
                    executeVimCommand(focusedWindow, "\\<C-w>r")
                },
            },
            {
                type: "separator",
            },
            {
                label: "Equal Size",
                click(item, focusedWindow) {
                    executeVimCommand(focusedWindow, "\\<C-w>=")
                },
            },
            {
                label: "Max Height",
                click(item, focusedWindow) {
                    executeVimCommand(focusedWindow, "\\<C-w>_")
                },
            },
            {
                label: "Min Height",
                click(item, focusedWindow) {
                    executeVimCommand(focusedWindow, "\\<C-w>1_")
                },
            },
            {
                label: "Max Width",
                click(item, focusedWindow) {
                    executeVimCommand(focusedWindow, "\\<C-w>|")
                },
            },
            {
                label: "Min Width",
                click(item, focusedWindow) {
                    executeVimCommand(focusedWindow, "\\<C-w>1|")
                },
            },
        ],
    })

    // View menu
    menu.push({
        label: "View",
        submenu: [
            {
                label: "Command Palette...",
                accelerator: "CmdOrCtrl+O+Shift+P",
                click(item, focusedWindow) {
                    executeOniCommand(focusedWindow, "commands.show")
                },
            },
            { type: "separator" },
            {
                label: "Explorer",
                accelerator: "CmdOrCtrl+O+Shift+E",
                click(item, focusedWindow) {
                    executeOniCommand(focusedWindow, "explorer.toggle")
                },
            },
            {
                label: "Search",
                accelerator: "CmdOrCtrl+O+Shift+F",
                click(item, focusedWindow) {
                    executeOniCommand(focusedWindow, "search.searchAllFiles")
                },
            },
            { type: "separator" },
            { role: "togglefullscreen" },
        ],
    })

    // Help menu
    menu.push({
        label: "Help",
        submenu: [
            {
                label: "Learn more",
                click(item, focusedWindow) {
                    openUrl(focusedWindow, "https://github.com/onivim/oni#introduction")
                },
            },
            {
                label: "Issues",
                click(item, focusedWindow) {
                    openUrl(focusedWindow, "https://github.com/onivim/oni/issues")
                },
            },
            {
                label: "GitHub",
                sublabel: "https://github.com/onivim/oni",
                click(item, focusedWindow) {
                    openUrl(focusedWindow, "https://github.com/onivim/oni")
                },
            },
            {
                label: "Website",
                sublabel: "https://www.onivim.io",
                click(item, focusedWindow) {
                    openUrl(focusedWindow, "https://www.onivim.io")
                },
            },
            {
                type: "separator",
            },
            {
                label: "About Oni",
                click(item, focusedWindow) {
                    executeOniCommand(focusedWindow, "oni.about")
                },
            },
            {
                type: "separator",
            },
            {
                role: "toggledevtools",
                accelerator: "",
            },
        ],
    })

    return Menu.buildFromTemplate(menu)
}
