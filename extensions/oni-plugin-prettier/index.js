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

    const checkPrettierrc = async bufferPath => {
        try {
            return await prettier.resolveConfig(bufferPath)
        } catch (e) {
            throw new Error(`Error parsing config file, ${e}`)
        }
    }

    const setStatusBarContents = (statusBarItem, defaultElement) => async (
        statusElement,
        timeOut = 3500,
    ) => {
        statusBarItem.setContents(statusElement)
        await setTimeout(() => statusBarItem.setContents(defaultElement), timeOut)
    }

    const setPrettierStatus = setStatusBarContents(prettierItem, prettierElement)

    const applyPrettier = () => {
        // Track the buffer state within the function using a closure
        // if the buffer as a string is the same as the last state
        // do no format because nothing has changed
        let lastBufferState = null

        // pass in Oni explicitly - Make dependencies clearer
        return async Oni => {
            const { activeBuffer } = Oni.editors.activeEditor

            const [arrayOfLines, cursorPosition] = await Promise.all([
                activeBuffer.getLines(),
                activeBuffer.getCursorPosition(),
            ])

            const { line, character } = cursorPosition
            const bufferString = arrayOfLines.join("\n")

            if (lastBufferState === bufferString) {
                return
            }

            let prettierCode

            try {
                const prettierrc = await checkPrettierrc(activeBuffer.filePath)
                const prettierConfig = prettierrc || config.settings
                const { cursorOffset } = activeBuffer

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
                await setPrettierStatus(errorElement)
            }

            if (prettierCode && prettierCode.formatted) {
                await setPrettierStatus(successElement)

                const formattedWithoutLastCR = prettierCode.formatted.replace(/\n$/, "")
                const formattedBufferArray = formattedWithoutLastCR.split("\n")
                lastBufferState = formattedWithoutLastCR
                await activeBuffer.setLines(0, arrayOfLines.length, formattedBufferArray)

                const { character, line } = await activeBuffer.convertOffsetToLineColumn(
                    prettierCode.cursorOffset,
                )

                await activeBuffer.setCursorPosition(line, character)
                await Oni.editors.activeEditor.neovim.command("w")
            }
        }
    }

    const applyPrettierWithState = applyPrettier()

    const isCompatible = buffer => {
        const defaultFiletypes = [".js", ".jsx", ".ts", ".tsx", ".md", ".html", ".json", ".graphql"]
        const allowedFiletypes =
            config && Array.isArray(config.allowedFiletypes)
                ? config.allowedFiletypes
                : defaultFiletypes
        const extension = path.extname(buffer.filePath)
        return allowedFiletypes.includes(extension)
    }

    Oni.editors.activeEditor.onBufferEnter.subscribe(buffer => {
        return isCompatible(buffer) ? prettierItem.show() : prettierItem.hide()
    })

    Oni.editors.activeEditor.onBufferSaved.subscribe(async buffer => {
        if (config.formatOnSave && config.enabled && isCompatible(buffer)) {
            await applyPrettierWithState(Oni)
        }
    })
    return { applyPrettier: applyPrettierWithState, isCompatible, checkPrettierrc }
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
