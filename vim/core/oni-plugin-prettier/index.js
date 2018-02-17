const os = require("os")
const path = require("path")
const prettier = require("prettier")

const activate = async Oni => {
    const config = Oni.configuration.getValue("oni.plugins.prettier")
    const prettierItem = Oni.statusBar.createItem(0, "oni.plugins.prettier")

    const { errorElement, successElement, prettierElement } = createPrettierComponent(Oni)

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

        let charactersTillCursor = 0
        for (let i = 0; i < line + 1; i += 1) {
            if (i === line) {
                charactersTillCursor += arrayOfLines[i].substring(0, character + 1).length
                break
            }
            charactersTillCursor += arrayOfLines[i].length
        }

        let prettierCode

        try {
            const prettierrc = await checkPrettierrc(activeBuffer.filePath)
            const prettierConfig = prettierrc || config.settings
            prettierCode = prettier.formatWithCursor(
                bufferString,
                Object.assign(prettierConfig, { cursorOffset: charactersTillCursor }),
            )
            if (!prettierCode.formatted) {
                throw new Error("Couldn't format the buffer")
            }
        } catch (e) {
            console.warn(`Couldn't format the buffer because: ${e}`)
            prettierItem.setContents(errorElement)
            await setTimeout(() => prettierItem.setContents(prettierElement), 3500)
        }

        if (prettierCode && prettierCode.formatted) {
            prettierItem.setContents(successElement)
            await setTimeout(() => prettierItem.setContents(prettierElement), 2500)

            await activeBuffer.setLines(
                0,
                arrayOfLines.length,
                prettierCode.formatted.split(os.EOL),
            )

            // Find position of the cursor which is prettierCode.cursorOffset i.e position in the string
            // slice up the character and count number of lines
            const beginning = prettierCode.formatted.substring(0, prettierCode.cursorOffset + 1)
            const beginningLines = beginning.split(os.EOL)
            const outputLine = beginningLines.length
            const outputColumn = beginningLines[beginningLines.length - 1].length

            // console.group('CURSOR===========')
            // console.log('Cursor last position', bufferString.substring(0, charactersTillCursor))
            // console.log('outputLine: ', outputLine)
            // console.log('outputColumn: ', outputColumn)
            // console.log('beginning: ', beginning)
            // console.log('beginningLines: ', beginningLines)
            // console.log('last : ', beginningLines[beginningLines.length - 1])
            // console.groupEnd()

            await activeBuffer.setCursorPosition(outputLine - 1, outputColumn)
        }
    }

    Oni.editors.activeEditor.onBufferSaved.subscribe(async buffer => {
        const allowedFiletypes = [".js", ".jsx", ".ts", ".tsx", ".md", ".html", ".json"]
        const extension = path.extname(buffer.filePath)
        const isCompatible = allowedFiletypes.includes(extension)
        if (config.formatOnSave && config.enabled && isCompatible) {
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

    const prettierIcon = (type = "indent") =>
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

    const successElement = React.createElement(
        "div",
        { style, className: "prettier" },
        iconContainer("check"),
        "Prettier",
    )

    return {
        errorElement,
        prettierElement,
        successElement,
    }
}

module.exports = { activate }
