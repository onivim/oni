// @ts-check
const path = require("path")

const OniApi = require("oni-api")

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

        const validBuffers = buffers.filter(b => !!b.filepath)

        const bufferMenuItems = validBuffers.map(b => ({
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
            const id = menu.selectedItem.label.includes("%") ? "%" : menu.selectedItem.metadata.id
            await Oni.editors.activeEditor.bufferDelete(id)
            menu.hide()
        }
    }

    const openBuffer = (menu, orientation) => {
        orientation = orientation || OniApi.FileOpenMode.Edit
        if (menu.selectedItem && menu.isOpen()) {
            const buffers = Oni.editors.activeEditor.getBuffers()
            try {
                const { filePath = "" } = menu.selectedItem.metadata
                Oni.editors.activeEditor.openFile(filePath, { openMode: orientation })
            } catch (e) {
                console.warn("[Oni Buffer Plugin Error]: ", e)
            } finally {
                menu.hide()
            }
        }
        return
    }

    Oni.commands.registerCommand({
        command: "buffer.delete",
        name: "Delete Selected Buffer",
        execute: async () => menu.isOpen() && (await deleteBuffer(menu)),
    })

    Oni.commands.registerCommand({
        command: "buffer.split",
        name: "Split Selected Buffer",
        execute: () => menu.isOpen() && openBuffer(menu, OniApi.FileOpenMode.HorizontalSplit),
    })

    Oni.commands.registerCommand({
        command: "buffer.vsplit",
        name: "Vertical Split Selected Buffer",
        execute: () => menu.isOpen() && openBuffer(menu, OniApi.FileOpenMode.VerticalSplit),
    })

    Oni.commands.registerCommand({
        command: "buffer.tabedit",
        name: "Open Selected Buffer in a Tab",
        execute: () => menu.isOpen() && openBuffer(menu, OniApi.FileOpenMode.NewTab),
    })

    Oni.commands.registerCommand({
        command: "buffer.open",
        name: "Open Bufferlist ",
        detail: "Open A List of All Available Buffers",
        execute: createBufferList,
    })

    Oni.commands.registerCommand({
        command: "buffer.toggle",
        name: "Toggle Bufferlist ",
        detail: "Toggle A List of All Available Buffers",
        execute: toggleBufferList,
    })

    menu.onItemSelected.subscribe(menuItem => {
        if (menuItem && menuItem.detail) {
            openBuffer(menu, { openMode: OniApi.FileOpenMode.Edit })
        }
    })

    Oni.editors.activeEditor.onBufferEnter.subscribe(() => updateBufferList(Oni, menu))
}

module.exports = { activate }
