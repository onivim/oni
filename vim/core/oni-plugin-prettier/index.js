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

        let sum = 0
        for (let i = 0; i < line + 1; i += 1) {
            sum += arrayOfLines[i].length
        }
        sum += character

        let prettierCode

        const prettierrc = await checkPrettierrc(activeBuffer.filePath)

        try {
            const prettierConfig = prettierrc || config.settings
            prettierCode = prettier.formatWithCursor(
                bufferString,
                Object.assign(prettierConfig, { cursorOffset: sum }),
            )
            if (!prettierCode.formatted) {
                throw new Error("Couldn't format the buffer")
            }
        } catch (e) {
            // Add indicator can't animate with React.creatElement
            prettierItem.setContents(errorElement)
            await setTimeout(() => prettierItem.setContents(prettierElement), 2500)
        }

        // FIXME: Reposition cursor correctly on format
        console.log("Cursor offset", prettierCode.cursorOffset)

        if (prettierCode && prettierCode.formatted) {
            await activeBuffer.setLines(
                0,
                arrayOfLines.length,
                prettierCode.formatted.split(os.EOL),
            )

            // Find position of the cursor which is prettierCode.cursorOffset i.e position in the string
            // slice up the character and count number of lines

            const beginning = prettierCode.formatted.substring(0, prettier.cursorOffset)
            const beginningLines = beginning.split(os.EOL)
            const line = beginningLines.length
            // console.group("CURSOR===========")
            // console.log("beginningLines: ", beginningLines)
            // console.log("last : ", beginningLines[beginningLines.length - 1])
            // console.log("prettier.cursorOffset: ", prettier.cursorOffset)
            // console.groupEnd()
            const column = beginningLines[beginningLines.length - 1].length - 1
            // const linesBeforeCursor = prettierCode.formatted.substring(0, prettierCode.cursorOffset)

            await activeBuffer.setCursorPosition(line, column)
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
