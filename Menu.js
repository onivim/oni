const electron = require('electron')
const os = require('os')

// Module to control application life.
const defaultMenu = require('electron-default-menu');
const { Menu, app, shell, dialog } = electron;


const buildMenu = (mainWindow) => {
    let menu = defaultMenu(app, shell);

    let firstMenu = os.platform() == "win32" ? 'File' : 'Oni';
    menu.unshift({
        label: firstMenu,
        submenu: [
            {
                label: 'Open...',
                click: (item, focusedWindow) => {
                    dialog.showOpenDialog(mainWindow, ['openFile'], (name) => {
                        if (name) {
                            mainWindow.webContents.send("menu-item-click", ":e " + name)
                        }
                    })
                }
            },
            {
                label: 'Split Open...',
                click: (item, focusedWindow) => {
                    dialog.showOpenDialog(mainWindow, ['openFile'], (name) => {
                        if (name) {
                            mainWindow.webContents.send("menu-item-click", ":sp " + name)
                        }
                    })
                }
            },
            {
                label: 'Tab Open...',
                click: (item, focusedWindow) => {
                    dialog.showOpenDialog(mainWindow, ['openFile'], (name) => {
                        if (name) {
                            mainWindow.webContents.send("menu-item-click", ":tabnew " + name)
                        }
                    })
                }
            },
            {
                label: 'New',
                click: (item, focusedWindow) => {
                    mainWindow.webContents.send("menu-item-click", ":enew")
                }
            },
            {
                label: 'Close',
                click: (item, focusedWindow) => {
                    mainWindow.webContents.send("menu-item-click", ":close")
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Save',
                click: (item, focusedWindow) => {
                    mainWindow.webContents.send("menu-item-click", ":w")
                }
            },
            {
                label: 'Save As...',
                click: (item, focusedWindow) => {
                    dialog.showSaveDialog(mainWindow, {}, (name) => {
                        if (name) {
                            mainWindow.webContents.send("menu-item-click", ":save " + name)
                        }
                    })
                }
            },
            {
                label: 'Save All',
                click: (item, focusedWindow) => {
                    mainWindow.webContents.send("menu-item-click", ":wall")
                }
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
    menu[1].submenu = [
       {
           label: 'Undo',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "u")
           }
       },
       {
           label: 'Redo',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "\\<C-r>")
           }
       },
       {
           label: 'Repeat',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", ".")
           }
       },
       {
           type: 'separator'
       },
       {
           label: 'Cut',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", '\\"+x')
           }
       },
       {
           label: 'Copy',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", '\\"+y')
           }
       },
       {
           label: 'Paste',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", '\\"+gP')
           }
       },
       {
           label: 'Paste Line Before',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "[p")
           }
       },
       {
           label: 'Paste Line After',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "]p")
           }
       },
       {
           label: 'Select All',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "ggVG")
           }
       }
    ]

    // Window menu
    menu[3].label = 'Split'
    menu[3].submenu = [
        {
           label: 'New Horizontal Split',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "\\<C-w>n")
           }
        },
        {
           label: 'Split File Horizontally',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "\\<C-w>s")
           }
        },
        {
           label: 'Split File Vertically',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "\\<C-w>v")
           }
        },
        {
           label: 'File Explorer Split',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", ":Lexplore | vertical resize 30")
           }
        },
        {
            type: 'separator'
        },
        {
           label: 'Close',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "\\<C-w>c")
           }
        },
        {
           label: 'Close Other Split(s)',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "\\<C-w>o")
           }
        },
        {
            type: 'separator'
        },
        {
           label: 'Move To',
           submenu: [
           {
                label: 'Top',
                click: (item, focusedWindow) => {
                    mainWindow.webContents.send("menu-item-click", "\\<C-w>K")
                }
            },
            {
                label: 'Bottom',
                click: (item, focusedWindow) => {
                    mainWindow.webContents.send("menu-item-click", "\\<C-w>J")
                }
            },
            {
                label: 'Left Side',
                click: (item, focusedWindow) => {
                    mainWindow.webContents.send("menu-item-click", "\\<C-w>H")
                }
            },
            {
                label: 'Right Side',
                click: (item, focusedWindow) => {
                    mainWindow.webContents.send("menu-item-click", "\\<C-w>L")
                }
            }]
        },
        {
           label: 'Rotate Up',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "\\<C-w>R")
           }
        },
        {
           label: 'Rotate Down',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "\\<C-w>r")
           }
        },
        {
            type: 'separator'
        },
        {
           label: 'Equal Size',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "\\<C-w>=")
           }
        },
        {
           label: 'Max Height',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "\\<C-w>_")
           }
        },
        {
           label: 'Min Height',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "\\<C-w>1_")
           }
        },
        {
           label: 'Max Width',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "\\<C-w>|")
           }
        },
        {
           label: 'Min Width',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "\\<C-w>1|")
           }
        }
    ]

    // Help menu
    menu[4].submenu = [
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
        }
    ]


    return Menu.buildFromTemplate(menu)
}

module.exports = {
    buildMenu: buildMenu
}
