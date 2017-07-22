const Q = require("q")
const path = require("path")

const rgb = (r, g, b) => `rgb(${r}, ${g}, ${b})`

const activate = (Oni) => {
    const React = Oni.dependencies.React

    const filePathItem = Oni.statusBar.createItem(0, -1, "oni.status.filePath")
    const fileTypeItem = Oni.statusBar.createItem(0, 0, "oni.status.fileType")
    const lineNumberItem = Oni.statusBar.createItem(1, -1, "oni.status.lineNumber")
    const modeItem = Oni.statusBar.createItem(1, -2, "oni.status.mode")


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

    const setFileType = (fileType) => {

        if (!fileType) {
            fileTypeItem.hide()
            return
        }

        const fileTypeStyle = {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            backgroundColor: "rgb(35, 35, 35)",
            color: "rgb(200, 200, 200)",
            paddingRight: "8px",
            paddingLeft: "8px"
        }

        const element = React.createElement("div", { style: fileTypeStyle }, fileType)

        fileTypeItem.setContents(element)
        fileTypeItem.show()
    }

    Oni.on("mode-change", (evt) => {
        setMode(evt)
    })

    Oni.on("cursor-moved", (evt) => {
        setLineNumber(evt.line, evt.column)
    })

    Oni.on("buffer-enter", (evt) => {
        setFileType(evt.filetype)
        setFilePath(evt.bufferFullPath)
    })

    setMode("normal")
    setLineNumber(1, 1)
    setFilePath(null)
    setFileType(null)

    modeItem.show()
    lineNumberItem.show()
    filePathItem.show()
}

module.exports = {
    activate
}
