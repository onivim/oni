import { Plugin, Menu } from "oni-api"
import { readdir, stat } from "fs-extra"
import { homedir } from "os"
import * as path from "path"

interface IBookmarkItem {
    fullPath: string
    type: string
}

const formatFilesOrFolders = async (fileOrFolder: string, parentDir: string) => {
    const isDirectory = await isDir(path.join(parentDir, fileOrFolder))
    return {
        fullPath: path.join(parentDir, fileOrFolder),
        type: isDirectory ? "folder" : "file",
    }
}

const getDirectoryContents = async (dirname: string) => {
    if (await isDir(dirname)) {
        const files = await readdir(dirname)
        return Promise.all(files.map(file => formatFilesOrFolders(file, dirname)))
    }
    return null
}

const isDir = async (path: string) => {
    try {
        const stats = await stat(path)
        return stats.isDirectory()
    } catch (error) {
        console.warn(error)
        return false
    }
}

const convertToMenuItem = ({ type, fullPath }: IBookmarkItem): Menu.MenuOption => ({
    icon: type,
    label: path.basename(fullPath),
    detail: fullPath,
    metadata: { type },
})

const handleItem = ({ selectedItem }: Menu.MenuInstance, oni: Plugin.Api) => {
    return selectedItem.metadata.type === "folder"
        ? oni.workspace.changeDirectory(selectedItem.detail)
        : oni.editors.activeEditor.openFile(selectedItem.detail)
}

type SetupCommand = (menu: Menu.MenuInstance) => void

const createSubMenu = async (
    item: Menu.MenuOption,
    oni: Plugin.Api,
    setupCommand: SetupCommand,
) => {
    try {
        const contents = await getDirectoryContents(item.detail)
        if (!contents) {
            return
        }
        oni.menu.closeActiveMenu()
        const bookmarksDirectoryMenu = oni.menu.create()

        const items = contents.map(convertToMenuItem)
        setupCommand(bookmarksDirectoryMenu)
        bookmarksDirectoryMenu.show()
        bookmarksDirectoryMenu.setItems(items)

        bookmarksDirectoryMenu.onItemSelected.subscribe(async item => {
            if (item) {
                const isDirectory = item.type === "folder" || (await isDir(item.detail))
                return isDirectory
                    ? createSubMenu(item, oni, setupCommand)
                    : oni.editors.activeEditor.openFile(item.detail)
            }
        })
        return bookmarksDirectoryMenu
    } catch (error) {
        oni.log.warn(`Failed to create submenu for ${item.label}, with path ${item.detail}`)
        return null
    }
}

const getAbsolutePath = (bookmark: string, oni: Plugin.Api) => {
    const userBaseDir = oni.configuration.getValue<string>("oni.bookmarks.baseDirectory")
    const baseDir = userBaseDir || homedir()
    return path.join(baseDir, bookmark)
}

const createBookmarksMenu = (oni: Plugin.Api) => {
    const bookmarksMenu = oni.menu.create()
    const bookmarks = oni.configuration.getValue<string[]>("oni.bookmarks")
    const menuItems: Menu.MenuOption[] = bookmarks.map(item =>
        convertToMenuItem({ fullPath: getAbsolutePath(item, oni), type: "folder" }),
    )

    bookmarksMenu.show()
    bookmarksMenu.setItems(menuItems)

    const setupCommand = (menu: Menu.MenuInstance) => {
        oni.commands.registerCommand({
            name: "Bookmarks: set folder to workspace or open file",
            detail: "(Menu Only) Set folder to workspace or open file",
            command: "oni.bookmarks.setFolderOrOpenFile",
            enabled: () => menu.isOpen(),
            execute: () => handleItem(menu, oni),
        })
    }

    // setup command the first time, then reset for each subsequent submenu
    // by passing the setup function down so each subsequent reference to the
    // menu is the newly created menu
    setupCommand(bookmarksMenu)

    bookmarksMenu.onItemSelected.subscribe(async item => {
        await createSubMenu(item, oni, setupCommand)
    })
}

export const activate = (oni: Plugin.Api) => {
    oni.commands.registerCommand({
        command: "oni.bookmarks.openMenu",
        name: "Bookmarks: Open menu",
        detail: "Toggle your chosen bookmarks menu",
        execute: () => createBookmarksMenu(oni),
    })
}
