import * as os from "os"

import { app, BrowserWindow, dialog, Menu } from "electron"
import { createWindow } from "./main"

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
    const normalizePath = (fileName) => fileName.split("\\").join("/")

    // const ensureWindow = (currentWindow: BrowserWindow) => {
    //     return currentWindow ? currentWindow : createWindow([], process.cwd())
    // }

    const executeVimCommand = (browserWindow: BrowserWindow, command: string) => {
        const delayedEvent = { evt: "menu-item-click", cmd: [command] }
        if (browserWindow) {
            return browserWindow.webContents.send(delayedEvent.evt, ...delayedEvent.cmd)
        }
        createWindow([], process.cwd(), delayedEvent)
    }

    const executeVimCommandForMultipleFiles = (
        browserWindow: BrowserWindow,
        command: string,
        files: string[],
    ) => {
        const delayedEvent = { evt: "open-files", cmd: [command, files] }
        if (browserWindow) {
            return browserWindow.webContents.send(delayedEvent.evt, ...delayedEvent.cmd)
        }
        createWindow([], process.cwd(), delayedEvent)
    }

    const executeOniCommand = (browserWindow: BrowserWindow, command: string) => {
        const delayedEvent = { evt: "execute-command", cmd: [command] }
        if (browserWindow) {
            return browserWindow.webContents.send(delayedEvent.evt, ...delayedEvent.cmd)
        }

        createWindow([], process.cwd(), delayedEvent)
    }

    const openUrl = (browserWindow: BrowserWindow, url: string) => {
        const delayedEvent = { evt: "execute-command", cmd: ["browser.openUrl", url] }
        if (browserWindow) {
            browserWindow.webContents.send(delayedEvent.evt, ...delayedEvent.cmd)
        }
    }
    const executeVimCommandForFiles = (browserWindow, command, files) => {
        if (!files || !files.length) {
            return
        }

        files.forEach((fileName) => executeVimCommand(browserWindow, `${command} ${normalizePath(fileName)}`))
    }

    const isWindows = os.platform() === "win32"

    const preferences = {
        label: "Preferences",
        submenu: [
            {
                label: "Edit Oni config",
                click(item, focusedWindow) {
                    executeOniCommand(focusedWindow, "oni.config.openConfigJs")
                },
            },
        ],
    }

    if (loadInit) {
        preferences.submenu.push(
            {
                label: "Edit Neovim config",
                click(item, focusedWindow) {
                    executeOniCommand(focusedWindow, "oni.config.openInitVim")
                },
            },
        )
    }

    const reopenWithEncoding = {
        label: "Reopen with Encoding",
        submenu: [],
    }

    // TODO: Maybe better show normal encoding name in submenu?
    // Encoding list from http://vimdoc.sourceforge.net/htmldoc/mbyte.html#encoding-values
    const encodingList = ["utf-8", "utf-16le", "utf-16be", "utf-32le", "utf-32be", "latin1", "koi8-r", "koi8-u", "macroman", "cp437", "cp737", "cp775", "cp850", "cp852", "cp855", "cp857", "cp860", "cp861", "cp862", "cp863", "cp865", "cp866", "cp869", "cp874", "cp1250", "cp1251", "cp1253", "cp1254", "cp1255", "cp1256", "cp1257", "cp1258", "cp932", "euc-jp", "sjis", "cp949", "euc-kr", "cp936", "euc-cn", "cp950", "big5", "euc-tw"].map((val) => {
        return {
            label: val.toUpperCase(),
            click(item, focusedWindow) {
                executeVimCommand(focusedWindow, ":e! ++enc=" + val)
            },
        }
    })

    reopenWithEncoding.submenu.push(...encodingList)

    menu.push({
        label: isWindows ? "File" : "Oni",
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
                        (files) => executeVimCommandForMultipleFiles(focusedWindow, ":tabnew ", files),
                    )
                },
            },
            {
                label: "Open Folder…",
                click(item, focusedWindow) {
                    executeOniCommand(focusedWindow, "oni.openFolder")
                },
            },
            reopenWithEncoding,
            {
                label: "Split Open…",
                click(item, focusedWindow) {
                    dialog.showOpenDialog(
                        focusedWindow, { properties: ["openFile"] },
                        (files) => executeVimCommandForFiles(focusedWindow, ":sp", files),
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
                    dialog.showSaveDialog(focusedWindow, {}, (name) => {
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
            preferences,
            {
                type: "separator",
            },
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
            {
                type: "separator",
            },
            {
                label: "Exit",
                click(item, focusedWindow) {
                    app.quit()
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
                    executeVimCommand(focusedWindow, '\\"+y')
                },
            },
            {
                label: "Cut",
                click(item, focusedWindow) {
                    executeVimCommand(focusedWindow, '\\"+x')
                },
            },
            {
                label: "Paste",
                click(item, focusedWindow) {
                    executeVimCommand(focusedWindow, '\\"+gP')
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
                            executeVimCommand(focusedWindow, ":let @" + (isWindows ? "*" : "+") + "=expand('%:p')")
                        },
                    },
                    {
                        label: "Full Path with Line Number",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, ":let @" + (isWindows ? "*" : "+") + "=expand('%:p') . ':' . line('.')")
                        },
                    },
                    {
                        label: "Relative Path",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, ":let @" + (isWindows ? "*" : "+") + "=expand('%')")
                        },
                    },
                    {
                        label: "Relative Path with Line Number",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, ":let @" + (isWindows ? "*" : "+") + "=expand('%') . ':' . line('.')")
                        },
                    },
                    {
                        label: "File Name",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, ":let @" + (isWindows ? "*" : "+") + "=expand('%:t')")
                        },
                    },
                    {
                        label: "File Name with Line Number",
                        click(item, focusedWindow) {
                            executeVimCommand(focusedWindow, ":let @" + (isWindows ? "*" : "+") + "=expand('%:t') . ':' . line('.')")
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
                            executeVimCommand(focusedWindow, ":%s/^\s\+//")
                            executeVimCommand(focusedWindow, ":%s/\s\+$//")
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
                            executeVimCommand(focusedWindow, ":put =strftime('%a, %d %b %Y %H:%M:%S')")
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
                            executeVimCommand(focusedWindow, ":put =expand('%:t') . ':' . line('.')")
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
        submenu : [
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
                label: "File Explorer Split",
                click(item, focusedWindow) {
                    executeVimCommand(focusedWindow, ":Lexplore | vertical resize 30")
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
                label: "Github",
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
                label: "Developer Tools",
                click(item, focusedWindow) {
                    executeOniCommand(focusedWindow, "oni.debug.openDevTools")
                },
            },
        ],
    })

    return Menu.buildFromTemplate(menu)
}
