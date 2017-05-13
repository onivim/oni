const Q = require("q")
const path = require("path")

const activate = (Oni) => {
    const filePathItem = Oni.statusBar.createItem(0, -1)
    const lineNumberItem = Oni.statusBar.createItem(1, -1)

    const setLineNumber = (line, column) => {
        lineNumberItem.setContents(`${line}, ${column}`)
    }

    const setFilePath = (filePath) => {
        if (!filePath) {
            filePathItem.setContents("[No Name]")
        } else {
            filePathItem.setContents(filePath)
        }
    }

    Oni.on("cursor-moved", (evt) => {
        setLineNumber(evt.line, evt.column)
    })

    Oni.on("buffer-enter", (evt) => {
        setFilePath(evt.bufferFullPath)
    })

    setLineNumber(1, 1)
    setFilePath(null)

    lineNumberItem.show()
    filePathItem.show()
}

module.exports = {
    activate
}
