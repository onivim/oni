const path = require("path")

const rgb = (r, g, b) => `rgb(${r}, ${g}, ${b})`

const activate = Oni => {
    const React = Oni.dependencies.React
    const items = Oni.configuration.getValue("statusbar.priority", {})
    const ids = Object.keys(items)

    const mode = ids.find(id => id.includes("mode"))
    const linenumber = ids.find(id => id.includes("linenumber"))
    const dir = ids.find(id => id.includes("workingDir"))
    const gitHubRepo = ids.find(id => id.includes("gitHubRepo"))

    const workingDirectoryItem = Oni.statusBar.createItem(0, dir)
    const lineNumberItem = Oni.statusBar.createItem(1, linenumber)
    const modeItem = Oni.statusBar.createItem(1, mode)
    const gitHubRepoItem = Oni.statusBar.createItem(1, gitHubRepo)

    const setMode = mode => {
        const getBackgroundColorForMode = m => {
            switch (m) {
                case "insert":
                case "replace":
                    return Oni.colors.getColor("highlight.mode.insert.background")
                case "operator":
                    return Oni.colors.getColor("highlight.mode.operator.background")
                case "visual":
                    return Oni.colors.getColor("highlight.mode.visual.background")
                default:
                    return Oni.colors.getColor("highlight.mode.normal.background")
            }
        }

        const getForegroundColorForMode = m => {
            switch (m) {
                case "insert":
                case "replace":
                    return Oni.colors.getColor("highlight.mode.insert.foreground")
                case "operator":
                    return Oni.colors.getColor("highlight.mode.operator.foreground")
                case "visual":
                    return Oni.colors.getColor("highlight.mode.visual.foreground")
                default:
                    return Oni.colors.getColor("highlight.mode.normal.foreground")
            }
        }

        const parseMode = m => {
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
            alignItems: "center",
            paddingLeft: "8px",
            paddingRight: "8px",
            textTransform: "uppercase",
            color: getForegroundColorForMode(mode),
            backgroundColor: getBackgroundColorForMode(mode),
        }

        const modeElement = React.createElement(
            "div",
            { style, className: "mode" },
            parseMode(mode),
        )
        modeItem.setContents(modeElement)
    }

    const setLineNumber = (line, column) => {
        const element = React.createElement("div", null, `${line}, ${column}`)
        lineNumberItem.setContents(element)
    }

    const setWorkingDirectory = workingDirectory => {
        if (!workingDirectory) {
            workingDirectory = ""
        }

        const openFolderCommand = () => {
            Oni.commands.executeCommand("workspace.openFolder")
        }

        const element = React.createElement(
            "div",
            {
                style: {
                    color: "rgb(140, 140, 140)",
                    maxWidth: "25rem",
                    textOverflow: "ellipsis",
                    whitespace: "nowrap",
                    overflow: "hidden",
                },
                onClick: openFolderCommand,
            },
            workingDirectory,
        )
        workingDirectoryItem.setContents(element)
    }

    const setGitHubRepo = () => {
        const openGitHubRepoCommand = () => {
            Oni.commands.executeCommand("browser.openUrl", "https://github.com/onivim/oni")
        }

        const gitHubIcon = Oni.ui.createIcon({
            name: "github",
            size: Oni.ui.iconSize.Default,
        })

        const element = React.createElement("div", { onClick: openGitHubRepoCommand }, gitHubIcon)
        gitHubRepoItem.setContents(element)
    }

    Oni.editors.activeEditor.onModeChanged.subscribe(newMode => {
        setMode(newMode)
    })

    Oni.editors.activeEditor.onCursorMoved.subscribe(cursor => {
        setLineNumber(cursor.line + 1, cursor.column + 1)
    })

    Oni.workspace.onDirectoryChanged.subscribe(newDirectory => {
        setWorkingDirectory(newDirectory)
    })

    setMode("normal")
    setLineNumber(1, 1)
    setWorkingDirectory(null)
    setWorkingDirectory(process.cwd())
    setGitHubRepo()

    modeItem.show()
    lineNumberItem.show()
    workingDirectoryItem.show()
    gitHubRepoItem.show()
}

module.exports = {
    activate,
}
