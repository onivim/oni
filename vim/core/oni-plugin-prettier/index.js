const os = require("os")
const prettier = require("prettier")

const activate = async Oni => {
    const currentBuffer = Oni.editors.activeEditor.activeBuffer
    const config = Oni.configuration.getValue("oni.plugins.prettier")

    async function applyPrettier(buffer = currentBuffer) {
        const arrayOfLines = await currentBuffer.getLines()
        const cursorPosition = await currentBuffer.getCursorPosition()
        const { line, character } = cursorPosition
        const bufferString = arrayOfLines.join(os.EOL)

        // TODO: Add option to turn off prettier and to set when it runs

        const prettierCode = prettier.formatWithCursor(
            bufferString,
            Object.assign(config, {
                cursorOffset: line,
            }),
        )

        // FIXME: Reposition cursor correctly on format
        // console.log("Cursor offset", prettierCode.cursorOffset)

        await Oni.editors.activeEditor.activeBuffer.setLines(
            0,
            arrayOfLines.length,
            prettierCode.formatted.split(os.EOL),
        )
    }

    Oni.editors.activeEditor.onBufferSaved.subscribe(async buffer => {
        await applyPrettier(buffer)
    })

    Oni.editors.activeEditor.onBufferEnter.subscribe(async buffer => {
        await applyPrettier(buffer)
    })
}

module.exports = { activate }
