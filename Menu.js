const electron = require('electron')
const os = require('os')

// Module to control application life.
const { Menu, app, shell, dialog } = electron;


const buildMenu = (mainWindow, loadInit) => {
    let menu = []

    // On Windows, both the forward slash `/` and the backward slash `\` are accepted as path delimiters.
    // The node APIs only return the backward slash, ie: `C:\\oni\\README.md`, but this causes problems
    // for VIM as it sees escape keys.
    const normalizePath = (fileName) => fileName.split("\\").join("/")

    const executeVimCommand = (command) => mainWindow.webContents.send("menu-item-click", command)

    const executeOniCommand = (command) => mainWindow.webContents.send("execute-command", command)

    const executeVimCommandForFiles = (command, files) => {
        if (!files || !files.length)
            return

        files.forEach((fileName) => executeVimCommand(`${command} ${normalizePath(fileName)}`))
    }

    let preferences = {
        label: 'Preferences',
        submenu: [
            {
                label: "Edit Oni config",
                click: () => executeOniCommand("oni.config.openConfigJs")
            },
        ]
    }

    if (loadInit) {
        preferences.submenu.push(
        {
            label: "Edit Neovim config",
            click: () => executeOniCommand("oni.config.openInitVim")
        })
    }

    let firstMenu = os.platform() == "win32" ? 'File' : 'Oni';
    menu.unshift({
        label: firstMenu,
        submenu: [
            {
                label: 'Open...',
                click: (item, focusedWindow) => {
                    dialog.showOpenDialog(mainWindow, ['openFile'], (files) => {
                        executeVimCommandForFiles(":e", files)
                    })
                }
            },
            {
                label: 'Split Open...',
                click: (item, focusedWindow) => {
                    dialog.showOpenDialog(mainWindow, ['openFile'], (files) => {
                        executeVimCommandForFiles(":sp", files)
                    })
                }
            },
            {
                label: 'Tab Open...',
                click: (item, focusedWindow) => {
                    dialog.showOpenDialog(mainWindow, ['openFile'], (files) => {
                        executeVimCommandForFiles(":tabnew", files)
                    })
                }
            },
            {
                label: 'New',
                click: (item, focusedWindow) => executeVimCommand(":enew")
            },
            {
                label: 'Close',
                click: (item, focusedWindow) => executeVimCommand(":close")
            },
            {
                type: 'separator'
            },
            preferences,
            {
                type: 'separator'
            },
            {
                label: 'Save',
                click: (item, focusedWindow) => executeVimCommand(":w")
            },
            {
                label: 'Save As...',
                click: (item, focusedWindow) => {
                    dialog.showSaveDialog(mainWindow, {}, (name) => {
                        if (name) {
                            executeVimCommand(":save " + name)
                        }
                    })
                }
            },
            {
                label: 'Save All',
                click: (item, focusedWindow) => executeVimCommand(":wall")
            },
            {
                type: 'separator'
            },
            {
                label: 'Quit',
                click: (item, focusedWindow) => {
                    app.quit()
                }
            }
        ]
    })

    // Edit menu
    menu.push({
        label: "Edit",
        submenu:  [

       {
           label: 'Undo',
           click: (item, focusedWindow) => executeVimCommand("u")
       },
       {
           label: 'Redo',
           click: (item, focusedWindow) => executeVimCommand("\\<C-r>")
       },
       {
           label: 'Repeat',
           click: (item, focusedWindow) => executeVimCommand(".")
       },
       {
           type: 'separator'
       },
       {
           label: 'Cut',
           click: (item, focusedWindow) => executeVimCommand('\\"+x')
       },
       {
           label: 'Copy',
           click: (item, focusedWindow) => executeVimCommand('\\"+y')
       },
       {
           label: 'Paste',
           click: (item, focusedWindow) => executeVimCommand('\\"+gP')
       },
       {
           label: 'Paste Line Before',
           click: (item, focusedWindow) => executeVimCommand("[p")
       },
       {
           label: 'Paste Line After',
           click: (item, focusedWindow) => executeVimCommand("]p")
       },
       {
           label: 'Select All',
           click: (item, focusedWindow) => executeVimCommand("ggVG")
       }
    ]})

    // Window menu
    menu.push({

        label:  'Split',
    submenu : [
        {
           label: 'New Horizontal Split',
           click: (item, focusedWindow) => executeVimCommand("\\<C-w>n")
        },
        {
           label: 'Split File Horizontally',
           click: (item, focusedWindow) => executeVimCommand("\\<C-w>s")
        },
        {
           label: 'Split File Vertically',
           click: (item, focusedWindow) => executeVimCommand("\\<C-w>v")
        },
        {
           label: 'File Explorer Split',
           click: (item, focusedWindow) => executeVimCommand(":Lexplore | vertical resize 30")
        },
        {
            type: 'separator'
        },
        {
           label: 'Close',
           click: (item, focusedWindow) => executeVimCommand("\\<C-w>c")
        },
        {
           label: 'Close Other Split(s)',
           click: (item, focusedWindow) => executeVimCommand("\\<C-w>o")
        },
        {
            type: 'separator'
        },
        {
           label: 'Move To',
           submenu: [
           {
                label: 'Top',
                click: (item, focusedWindow) => executeVimCommand("\\<C-w>K")
            },
            {
                label: 'Bottom',
                click: (item, focusedWindow) => executeVimCommand("\\<C-w>J")
            },
            {
                label: 'Left Side',
                click: (item, focusedWindow) => executeVimCommand("\\<C-w>H")
            },
            {
                label: 'Right Side',
                click: (item, focusedWindow) => executeVimCommand("\\<C-w>L")
            }]
        },
        {
           label: 'Rotate Up',
           click: (item, focusedWindow) => executeVimCommand("\\<C-w>R")
        },
        {
           label: 'Rotate Down',
           click: (item, focusedWindow) => executeVimCommand("\\<C-w>r")
        },
        {
            type: 'separator'
        },
        {
           label: 'Equal Size',
           click: (item, focusedWindow) => executeVimCommand("\\<C-w>=")
        },
        {
           label: 'Max Height',
           click: (item, focusedWindow) => executeVimCommand("\\<C-w>_")
        },
        {
           label: 'Min Height',
           click: (item, focusedWindow) => executeVimCommand("\\<C-w>1_")
        },
        {
           label: 'Max Width',
           click: (item, focusedWindow) => executeVimCommand("\\<C-w>|")
        },
        {
           label: 'Min Width',
           click: (item, focusedWindow) => executeVimCommand("\\<C-w>1|")
        }
    ]})

    // Help menu
    menu.push({
        label: "Help",
        submenu: [
        {
            label: 'Learn more',
            click: (item, focusedWindow) => {
                shell.openExternal('https://github.com/extr0py/oni#introduction');
            }
        },
        {
            label: 'Issues',
            click: (item, focusedWindow) => {
                shell.openExternal('https://github.com/extr0py/oni/issues');
            }
        },
        {
            label: 'Github',
            click: (item, focusedWindow) => {
                shell.openExternal('https://github.com/extr0py/oni');
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Developer Tools',
            click: () => executeOniCommand('oni.debug.openDevTools')
        }
    ]})

    return Menu.buildFromTemplate(menu)
}

module.exports = {
    buildMenu: buildMenu
}
