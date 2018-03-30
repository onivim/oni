const os = require("os")
const path = require("path")
const prettier = require("prettier")

const activate = async Oni => {
    const config = Oni.configuration.getValue("oni.plugins.prettier")
    const prettierItem = Oni.statusBar.createItem(0, "oni.plugins.prettier")

    const callback = async () => {
        const isNormalMode = Oni.editors.activeEditor.mode === "normal"
        if (isNormalMode) {
            await applyPrettier()
        }
    }

    const { errorElement, successElement, prettierElement } = createPrettierComponent(Oni, callback)

    prettierItem.setContents(prettierElement)

    Oni.commands.registerCommand({
        command: "autoformat.prettier",
        name: "Autoformat with Prettier",
        execute: callback,
    })

    async function checkPrettierrc(bufferPath) {
        try {
            return await prettier.resolveConfig(bufferPath)
        } catch (e) {
            throw new Error(`Error parsing config file, ${e}`)
        }
    }

    // Track the buffer state if the buffer as a string is the same
    // as the last state do no format because nothing has changed
    let lastBufferState = null

    async function applyPrettier() {
        const { activeBuffer } = Oni.editors.activeEditor
        const arrayOfLines = await activeBuffer.getLines()
        const { line, character } = await activeBuffer.getCursorPosition()
        const bufferString = arrayOfLines.join(os.EOL)
        if (lastBufferState === bufferString) {
            return
        }

        let prettierCode

        try {
            const prettierrc = await checkPrettierrc(activeBuffer.filePath)
            const prettierConfig = prettierrc || config.settings
            const cursorOffset = activeBuffer.getCursorOffset()
            // Pass in the file path so prettier can infer the correct parser to use
            prettierCode = prettier.formatWithCursor(
                bufferString,
                Object.assign({ filepath: activeBuffer.filePath }, prettierConfig, {
                    cursorOffset,
                }),
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
            await setTimeout(() => prettierItem.setContents(prettierElement), 3500)

            const formattedWithoutLastCR = prettierCode.formatted.replace(/\n$/, "")
            lastBufferState = formattedWithoutLastCR
            await activeBuffer.setLines(
                0,
                arrayOfLines.length,
                formattedWithoutLastCR.split(os.EOL),
            )

            const { character, line } = await activeBuffer.convertOffsetToLineColumn(
                prettierCode.cursorOffset,
            )
            await activeBuffer.setCursorPosition(line - 1, character + 1)
        }
    }

    const isCompatible = buffer => {
        const defaultFiletypes = [".js", ".jsx", ".ts", ".tsx", ".md", ".html", ".json", ".graphql"]
        const allowedFiletypes = Array.isArray(config.allowedFiletypes)
            ? config.allowedFiletypes
            : defaultFiletypes
        const extension = path.extname(buffer.filePath)
        const isCompatible = allowedFiletypes.includes(extension)
        return isCompatible
    }

    Oni.editors.activeEditor.onBufferEnter.subscribe(buffer => {
        return isCompatible(buffer) ? prettierItem.show() : prettierItem.hide()
    })

    Oni.editors.activeEditor.onBufferSaved.subscribe(async buffer => {
        if (config.formatOnSave && config.enabled && isCompatible(buffer)) {
            await applyPrettier()
        }
    })
    return { applyPrettier, isCompatible, checkPrettierrc }
}

function createPrettierComponent(Oni, onClick) {
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

    const prettierIcon = (type = "magic") =>
        Oni.ui.createIcon({
            name: type,
            size: Oni.ui.iconSize.Default,
        })

    const iconContainer = (type, color = "white") =>
        React.createElement("div", { style: { padding: "0 6px 0 0", color } }, prettierIcon(type))

    const prettierElement = React.createElement(
        "div",
        { className: "prettier", style, onClick },
        iconContainer(),
        "prettier",
    )

    const errorElement = React.createElement(
        "div",
        { style, className: "prettier" },
        iconContainer("exclamation-triangle", "yellow"),
        "prettier",
    )

    const successElement = React.createElement(
        "div",
        { style, className: "prettier" },
        iconContainer("check", "#5AB379"),
        "prettier",
    )

    return {
        errorElement,
        prettierElement,
        successElement,
    }
}

module.exports = { activate }
