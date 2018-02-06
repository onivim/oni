const fs = require("fs")
const path = require("path")
const { promisify } = require("util")
const fsStat = promisify(fs.stat)

const activate = Oni => {
    const React = Oni.dependencies.React
    let isLoaded = false
    try {
        const updateBranchIndicator = async evt => {
            if (!evt) {
                return
            }
            const filePath = evt.filePath || evt.bufferFullPath
            const gitId = "oni.status.git"
            const gitBranchIndicator = Oni.statusBar.createItem(1, gitId)

            isLoaded = true
            let dir
            try {
                const isDir = await Oni.workspace.pathIsDir(filePath)
                const dir = isDir ? filePath : path.dirname(filePath)
                let branchName
                try {
                    branchName = await Oni.services.git.getBranch(dir)
                } catch (e) {
                    gitBranchIndicator.hide()
                    return
                    // return console.warn('[Oni.plugin.git]: No branch name found', e);
                    // branchName = 'Not a Git Repo';
                }

                const props = {
                    style: {
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                    },
                }

                const branchContainerProps = {
                    style: {
                        minWidth: "10px",
                        textAlign: "center",
                        padding: "2px 4px 0 0",
                    },
                }

                const branchIcon = Oni.ui.createIcon({
                    name: "code-fork",
                    size: Oni.ui.iconSize.Default,
                })

                const branchContainer = React.createElement(
                    "span",
                    branchContainerProps,
                    branchIcon,
                )

                const branchNameContainer = React.createElement(
                    "div",
                    { width: "100%" },
                    " " + branchName,
                )

                const gitBranch = React.createElement(
                    "div",
                    props,
                    branchContainer,
                    branchNameContainer,
                )

                gitBranchIndicator.setContents(gitBranch)
                gitBranchIndicator.show()
            } catch (e) {
                console.log("[Oni.plugin.git]: ", e)
                return gitBranchIndicator.hide()
            }
        }

        if (!isLoaded) {
            updateBranchIndicator(Oni.editors.activeEditor.activeBuffer)
        }

        Oni.editors.activeEditor.onBufferEnter.subscribe(
            async evt => await updateBranchIndicator(evt),
        )
        Oni.workspace.onFocusGained.subscribe(async buffer => await updateBranchIndicator(buffer))
    } catch (e) {
        console.warn("[Oni.plugin.git] ERROR", e)
    }
}

module.exports = {
    activate,
}
