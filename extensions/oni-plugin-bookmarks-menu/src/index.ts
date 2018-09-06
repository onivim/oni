import * as Oni from "oni-api"
import * as fs from "fs-extra"
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
    const absolutePath = path.isAbsolute(dirname) ? dirname : path.join(homedir(), dirname)
    try {
        if (await isDir(absolutePath)) {
            const files = await fs.readdir(absolutePath)
            return Promise.all(files.map(file => formatFilesOrFolders(file, absolutePath)))
        }
    } catch (e) {
        console.warn(e)
    }
}

const isDir = async (path: string) => {
    try {
        const stats = await fs.stat(path)
        return stats.isDirectory()
    } catch (error) {
        console.warn(error)
        return false
    }
}

const convertToMenuItem = ({ type, fullPath }: IBookmarkItem): Oni.Menu.MenuOption => ({
    icon: type,
    label: path.basename(fullPath),
    detail: fullPath,
    metadata: { type },
})

const handleItem = (menu: Oni.Menu.MenuInstance, oni: Oni.Plugin.Api) => {
    const { selectedItem } = menu
    return selectedItem.metadata.type === "folder"
        ? oni.workspace.changeDirectory(selectedItem.detail)
        : oni.editors.activeEditor.openFile(selectedItem.detail)
}

const createSubMenu = async (item: Oni.Menu.MenuOption, oni: Oni.Plugin.Api) => {
    const contents = await getDirectoryContents(item.detail)
    if (!contents) {
        return
    }
    oni.menu.closeActiveMenu()
    const bookmarksDirectoryMenu = oni.menu.create()

    const items = contents.map(convertToMenuItem)
    bookmarksDirectoryMenu.show()
    bookmarksDirectoryMenu.setItems(items)

    oni.commands.registerCommand({
        command: "oni.bookmarks.setFolderOrOpenFile",
        name: "",
        enabled: bookmarksDirectoryMenu.isOpen,
        execute: item => handleItem(bookmarksDirectoryMenu, oni),
    })

    bookmarksDirectoryMenu.onItemSelected.subscribe(async item => {
        const isDirectory = (item && item.type === "folder") || (await isDir(item.detail))
        return isDirectory
            ? await createSubMenu(item, oni)
            : await oni.editors.activeEditor.openFile(item.detail)
    })
}

const createBookmarksMenu = (oni: Oni.Plugin.Api) => {
    const bookmarksMenu = oni.menu.create()
    const bookmarks = oni.configuration.getValue<string[]>("oni.bookmarks")
    const menuItems: Oni.Menu.MenuOption[] = bookmarks.map(item =>
        convertToMenuItem({ fullPath: item, type: "folder" }),
    )

    bookmarksMenu.show()
    bookmarksMenu.setItems(menuItems)

    bookmarksMenu.onItemSelected.subscribe(async item => {
        await createSubMenu(item, oni)
    })
}

export const activate = (oni: Oni.Plugin.Api) => {
    oni.commands.registerCommand({
        command: "oni.bookmarks.toggleMenu",
        name: "Bookmarks: Open menu",
        detail: "Toggle your chosen bookmarks menu",
        execute: () => createBookmarksMenu(oni),
    })
}
