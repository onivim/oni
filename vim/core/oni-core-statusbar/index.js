const path = require("path")

const rgb = (r, g, b) => `rgb(${r}, ${g}, ${b})`

const activate = (Oni) => {
    const React = Oni.dependencies.React

    const workingDirectoryItem = Oni.statusBar.createItem(0, -1, "oni.status.workingDirectory")
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
            "alignItems": "center",
            "paddingLeft": "8px",
            "paddingRight": "8px",
            "textTransform": "uppercase",
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

    const setWorkingDirectory = (workingDirectory) => {
        if (!workingDirectory) {
            workingDirectory = ""
        }

        const openFolderCommand = () => {
            Oni.commands.executeCommand("oni.openFolder")
        }

        const element = React.createElement("div", { style: { color: "rgb(140, 140, 140)" }, onClick: openFolderCommand }, workingDirectory)
        workingDirectoryItem.setContents(element)
    }

    Oni.editors.activeEditor.onModeChanged.subscribe((newMode) => {
        setMode(newMode)
    })

    Oni.editors.activeEditor.onCursorMoved.subscribe((cursor) => {
        setLineNumber(cursor.line + 1, cursor.column + 1)
    })

    Oni.workspace.onDirectoryChanged.subscribe((newDirectory) => {
        setWorkingDirectory(newDirectory)
    })

    setMode("normal")
    setLineNumber(1, 1)
    setWorkingDirectory(null)
    setWorkingDirectory(process.cwd())

    modeItem.show()
    lineNumberItem.show()
    workingDirectoryItem.show()
}

module.exports = {
    activate
}
