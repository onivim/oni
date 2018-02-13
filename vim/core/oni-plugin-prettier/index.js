const os = require("os")
const prettier = require("prettier")

const activate = async Oni => {
    const config = Oni.configuration.getValue("oni.plugins.prettier")
    const prettierItem = Oni.statusBar.createItem(0, "oni.plugins.prettier")

    const { errorElement, prettierElement } = createPrettierComponent(Oni)

    prettierItem.setContents(prettierElement)
    prettierItem.show()

    Oni.commands.registerCommand({
        command: "autoformat.prettier",
        name: "Autoformat with Prettier",
        execute: async () => {
            const isNormalMode = Oni.editors.activeEditor.mode === "normal"
            if (isNormalMode) {
                await applyPrettier()
            }
        },
    })

    async function checkPrettierrc(bufferPath) {
        try {
            return await prettier.resolveConfig(bufferPath)
        } catch (e) {
            throw new Error(`Error parsing config file, ${e}`)
        }
    }

    async function applyPrettier() {
        const { activeBuffer } = Oni.editors.activeEditor
        const arrayOfLines = await activeBuffer.getLines()
        const cursorPosition = await activeBuffer.getCursorPosition()
        const { line, character } = cursorPosition
        const bufferString = arrayOfLines.join(os.EOL)

        let prettierCode

        const prettierrc = await checkPrettierrc(activeBuffer.filePath)

        try {
            const prettierConfig = prettierrc || config.settings
            prettierCode = prettier.formatWithCursor(
                bufferString,
                Object.assign(prettierConfig, {
                    cursorOffset: line,
                }),
            )
            if (!prettierCode.formatted) {
                throw new Error("Couldn't format the buffer")
            }
        } catch (e) {
            // Add indicator can't animate with React.creatElement
            prettierItem.setContents(errorElement)
        }

        // FIXME: Reposition cursor correctly on format
        console.log("Cursor offset", prettierCode.cursorOffset)

        if (prettierCode && prettierCode.formatted) {
            await activeBuffer.setLines(
                0,
                arrayOfLines.length,
                prettierCode.formatted.split(os.EOL),
            )

            await activeBuffer.setCursorPosition(prettierCode.cursorOffset, 0)
        }
    }

    Oni.editors.activeEditor.onBufferSaved.subscribe(async buffer => {
        if (config.formatOnSave && config.enabled) {
            await applyPrettier()
        }
    })
}

function createPrettierComponent(Oni) {
    const { React } = Oni.dependencies

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

    // const image = React.createElement(
    //     "img",
    //     { style: { width: "6px", height: "4px" }, src: require("./assets/prettier.png") },
    // )

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
        iconContainer("exclamation-triangle"),
        "Prettier",
    )

    return {
        errorElement,
        prettierElement,
    }
}

module.exports = { activate }
