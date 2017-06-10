const Q = require("q")
const path = require("path")

const rgb = (r, g, b) => `rgb(${r}, ${g}, ${b})`

const activate = (Oni) => {
    const React = Oni.dependencies.React

    const filePathItem = Oni.statusBar.createItem(0, -1)
    const lineNumberItem = Oni.statusBar.createItem(1, -1)
    const modeItem = Oni.statusBar.createItem(1, -2)

    const setMode = (mode) => {

        const getColorForMode = (m) => {
            switch (m) {
                case "insert":
                case "replace":
                   return rgb(0, 200, 100)
                case "operator":
                    return rgb(255, 100, 0)
                default:
                    return rgb(0, 100, 255)
            }
        }

        const parseMode = (m) => {
            // Need to change modes like `cmdline_insert`
            if (m.indexOf("_") >= 0) {
                return m.split("_")[1]
            } else {
                return m
            }
        }

        const style = {
            width: "100%",
            height: "100%",
            display: "flex",
            "align-items": "center",
            "padding-left": "8px",
            "padding-right": "8px",
            "text-transform": "uppercase",
            color: rgb(220, 220, 220),
            backgroundColor: getColorForMode(mode)
        }

        const modeElement  = React.createElement("div", { style }, parseMode(mode))
        modeItem.setContents(modeElement)
    }

    const setLineNumber = (line, column) => {
        const element = React.createElement("div", null, `${line}, ${column}`)
        lineNumberItem.setContents(element)
    }

    const setFilePath = (filePath) => {
        let filePathString = filePath
        if (!filePathString) {
            filePathString = "[No Name]"
        }

        const element = React.createElement("div", { style: { color: "rgb(140, 140, 140)" } }, filePathString)

        filePathItem.setContents(element)
    }

    Oni.on("mode-change", (evt) => {
        setMode(evt)
    })

    Oni.on("cursor-moved", (evt) => {
        setLineNumber(evt.line, evt.column)
    })

    Oni.on("buffer-enter", (evt) => {
        setFilePath(evt.bufferFullPath)
    })

    setMode("normal")
    setLineNumber(1, 1)
    setFilePath(null)

    modeItem.show()
    lineNumberItem.show()
    filePathItem.show()
}

module.exports = {
    activate
}
