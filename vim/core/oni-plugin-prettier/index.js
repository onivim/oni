const os = require("os")
const prettier = require("prettier")

const activate = async Oni => {
    const currentBuffer = Oni.editors.activeEditor.activeBuffer
    const config = Oni.configuration.getValue("oni.plugins.prettier")
    const { React } = Oni.dependencies

    const prettierItem = Oni.statusBar.createItem(0, "oni.plugins.prettier")

    const background = Oni.colors.getColor("highlight.mode.normal.background")
    const foreground = Oni.colors.getColor("highlight.mode.normal.foreground")
    const style = {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: "8px",
        paddingRight: "8px",
        color: "white",
        backgroundColor: foreground,
    }

    const prettierIcon = (type = "align-justify") =>
        Oni.ui.createIcon({
            name: type,
            size: Oni.ui.iconSize.Default,
        })

    const iconContainer = type =>
        React.createElement("div", { style: { padding: "0 6px 0 0" } }, prettierIcon(type))

    const prettierElement = React.createElement(
        "div",
        { style, className: "prettier" },
        iconContainer(),
        "Prettier",
    )

    const errorElement = React.createElement(
        "div",
        { style, className: "prettier" },
        iconContainer("cross"),
        "Prettier",
    )

    prettierItem.setContents(prettierElement)
    prettierItem.show()

    Oni.commands.registerCommand({
        command: "autoformat.prettier",
        name: "Autoformat with Prettier",
        execute: async () => await applyPrettier(),
    })

    async function applyPrettier(buffer = currentBuffer) {
        const arrayOfLines = await currentBuffer.getLines()
        const cursorPosition = await currentBuffer.getCursorPosition()
        const { line, character } = cursorPosition
        const bufferString = arrayOfLines.join(os.EOL)

        let prettierCode

        try {
            prettierCode = prettier.formatWithCursor(
                bufferString,
                Object.assign(config.settings, {
                    cursorOffset: line,
                }),
            )
        } catch (e) {
            // Add indicator can't animate with React.creatElement
            prettierItem.setContents(errorElement)
        }

        // FIXME: Reposition cursor correctly on format
        // console.log("Cursor offset", prettierCode.cursorOffset)

        if (prettierCode.formatted) {
            await Oni.editors.activeEditor.activeBuffer.setLines(
                0,
                arrayOfLines.length,
                prettierCode.formatted.split(os.EOL),
            )
            // FIXME: cursor position is off not sure what this value means
            await Oni.editors.activeEditor.activeBuffer.setCursorPosition(
                line + prettierCode.cursorOffset,
                0,
            )
        }
    }

    // TODO check for prettierrc and use that if present

    Oni.editors.activeEditor.onBufferSaved.subscribe(async buffer => {
        if (config.formatOnSave && config.enabled) {
            await applyPrettier(buffer)
        }
    })

    Oni.editors.activeEditor.onBufferEnter.subscribe(async buffer => {
        if (config.formatOnSave && config.enabled) {
            await applyPrettier(buffer)
        }
    })
}

module.exports = { activate }
