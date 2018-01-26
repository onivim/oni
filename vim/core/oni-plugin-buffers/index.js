// @ts-check
const path = require("path")

const activate = Oni => {
    const menu = Oni.menu.create()

    const truncateFilePath = filepath => {
        const sections = filepath.split(path.sep)
        const folderAndFiles = sections.slice(-2)
        return folderAndFiles.join(path.sep)
    }

    const updateBufferList = (Oni, menu) => {
        const buffers = Oni.editors.activeEditor.getBuffers()
        const active = Oni.editors.activeEditor.activeBuffer.filePath

        const bufferMenuItems = buffers.map(b => ({
            label: `${active === b.filePath ? b.id + " %" : b.id}`,
            detail: truncateFilePath(b.filePath),
            icon: Oni.ui.getIconClassForFile(b.filePath),
            pinned: active === b.filePath,
            metadata: { filePath: b.filePath, id: b.id },
        }))

        return bufferMenuItems
    }

    const createBufferList = () => {
        const buffers = updateBufferList(Oni, menu)
        menu.show()
        menu.setItems(buffers)
    }

    const toggleBufferList = () => {
        !menu.isOpen() ? createBufferList() : menu.hide()
    }

    const deleteBuffer = async menu => {
        if (menu.selectedItem) {
            await Oni.editors.activeEditor.bufferDelete(menu.selectedItem.metadata.id)
            // This line forces vim to navigate to the next buffer after deleting
            // NOTE: This is essential as otherwise Oni does not properly register the buffer
            // delete event
            await Oni.editors.activeEditor.neovim.command("bn")
            menu.hide()
        }
    }

    const openBuffer = (menu, orientation) => {
        if (menu.selectedItem && menu.isOpen()) {
            const buffers = Oni.editors.activeEditor.getBuffers()
            try {
                const { filePath = "" } = menu.selectedItem.metadata
                Oni.editors.activeEditor.openFile(filePath, orientation)
            } catch (e) {
                console.warn("[Oni Buffer Plugin Error]: ", e)
            } finally {
                menu.hide()
            }
        }
        return
    }

    Oni.commands.registerCommand({
        command: "bufferlist.delete",
        name: "Delete Selected Buffer",
        execute: async () => menu.isOpen() && (await deleteBuffer(menu)),
    })

    Oni.commands.registerCommand({
        command: "bufferlist.split",
        name: "Split Selected Buffer",
        execute: () => menu.isOpen() && openBuffer(menu, "horizontal"),
    })

    Oni.commands.registerCommand({
        command: "bufferlist.vsplit",
        name: "Vertical Split Selected Buffer",
        execute: () => menu.isOpen() && openBuffer(menu, "vertical"),
    })

    Oni.commands.registerCommand({
        command: "bufferlist.tabedit",
        name: "Open Selected Buffer in a Tab",
        execute: () => menu.isOpen() && openBuffer(menu, "tab"),
    })

    Oni.commands.registerCommand({
        command: "bufferlist.open",
        name: "Open Bufferlist ",
        detail: "Open A List of All Available Buffers",
        execute: createBufferList,
    })

    Oni.commands.registerCommand({
        command: "bufferlist.toggle",
        name: "Toggle Bufferlist ",
        detail: "Toggle A List of All Available Buffers",
        execute: toggleBufferList,
    })

    menu.onItemSelected.subscribe(menuItem => {
        if (menuItem && menuItem.detail) {
            openBuffer(menu, "edit")
        }
    })

    Oni.editors.activeEditor.onBufferEnter.subscribe(() => updateBufferList(Oni, menu))
}

module.exports = { activate }
