const os = require("os")
const prettier = require("prettier")

const activate = async Oni => {
    const currentBuffer = Oni.editors.activeEditor.activeBuffer

    async function applyPrettier(buffer = currentBuffer) {
        const arrayOfLines = await currentBuffer.getLines()
        const cursorPosition = await currentBuffer.getCursorPosition()
        const { line, character } = cursorPosition
        const bufferString = arrayOfLines.join(os.EOL)

        const prettierCode = prettier.formatWithCursor(bufferString, {
            semi: false,
            cursorOffset: line,
        })

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
