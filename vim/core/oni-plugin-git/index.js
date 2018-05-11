const fs = require("fs")
const path = require("path")
const { promisify } = require("util")
const fsStat = promisify(fs.stat)

const activate = Oni => {
    const React = Oni.dependencies.React

    const branchIcon = Oni.ui.createIcon({
        name: "code-fork",
        size: Oni.ui.iconSize.Default,
    })

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

    const createBranchList = async Oni => {
        const { workspace: { activeWorkspace: ws } } = Oni

        const [currentBranch, branches] = await Promise.all([
            Oni.services.git.getVCSBranch(ws),
            Oni.services.git.getLocalVCSBranches(ws),
        ])

        const menu = Oni.menu.create()
        const branchItems = branches.all.map(branch => ({
            label: branch,
            icon: branchIcon,
            pinned: currentBranch === branch,
        }))

        menu.show()
        menu.setItems(branchItems)
        menu.onItemSelected.subscribe(
            menuItem =>
                menuItem && menuItem.label && Oni.services.git.changeVCSBranch(menuItem.label, ws),
        )

        const fetchBranch = async (Oni, menu) => {
            if (menu.isOpen() && menu.selectedItem) {
                const res = await Oni.services.git.fetchVCSBranchFromRemote({
                    currentDir: ws,
                    branch: menu.selectedItem.label,
                })
                console.log("res: ", res)
            }
        }

        Oni.commands.registerCommand({
            command: "oni.git.fetch",
            name: "Fetch the selected branch",
            execute: () => fetchBranch(Oni, menu),
        })
    }

    Oni.commands.registerCommand({
        command: "oni.git.branches",
        name: "Local Git Branches",
        detail: "Open a menu with a list of all local branches",
        execute: () => createBranchList(Oni),
    })

    const createGitIcon = ({ styles, type, number }) => {
        if (!number) return
        const Icon = Oni.ui.createIcon({ name: `${type}-circle` })
        const Container = React.createElement("span", styles, Icon)
        const NumberContainer = React.createElement(
            "span",
            { style: { paddingLeft: "0.25rem" } },
            number,
        )

        return React.createElement("span", null, [Container, NumberContainer])
    }

    const addDeletionsAndInsertions = (summary, filePath) => {
        if (summary && (summary.insertions || summary.deletions)) {
            const { insertions, deletions, files } = summary

            const [insertionSpan, deletionSpan] = [
                {
                    type: "plus",
                    number: insertions,
                    style: { fontSize: "0.7rem", padding: "0 0.15rem", color: "green" },
                },
                {
                    type: "minus",
                    number: deletions,
                    style: { fontSize: "0.7rem", padding: "0 0.15rem", color: "red" },
                },
            ].map(createGitIcon)

            const hasBoth = deletions && insertions
            const spacer = hasBoth && React.createElement("span", null, ", ")

            return [insertionSpan, spacer, deletionSpan]
        }
        return []
    }

    const updateBranchIndicator = async branchName => {
        const gitId = "oni.status.git"
        const gitBranchIndicator = Oni.statusBar.createItem(1, gitId)
        const { filePath } = Oni.editors.activeEditor.activeBuffer

        try {
            const { activeWorkspace: ws } = Oni.workspace
            const branch = branchName || (await Oni.services.git.getVCSBranch(ws))
            if (!branch) throw new Error("The branch name could not be found")
            const summary = await Oni.services.git.getVCSStatus(ws)

            const branchContainer = React.createElement("span", branchContainerProps, branchIcon)
            const deletionsAndInsertions = addDeletionsAndInsertions(summary, filePath)

            const branchNameContainer = React.createElement("div", { width: "100%" }, [
                `${branch} `,
                ...deletionsAndInsertions,
            ])

            const gitBranch = React.createElement(
                "div",
                props,
                branchContainer,
                branchNameContainer,
            )
            gitBranchIndicator.setContents(gitBranch)
            gitBranchIndicator.show()
        } catch (e) {
            console.log("Oni git plugin encountered an error: ", e)
            return gitBranchIndicator.hide()
        }
    }

    updateBranchIndicator()

    Oni.editors.activeEditor.onBufferEnter.subscribe(async () => await updateBranchIndicator())

    Oni.services.git.onBranchChanged.subscribe(async newBranch => {
        await updateBranchIndicator(newBranch)
        await Oni.editors.activeEditor.neovim.command("e!")
    })

    Oni.editors.activeEditor.onBufferSaved.subscribe(async () => await updateBranchIndicator())
    Oni.workspace.onFocusGained.subscribe(async () => await updateBranchIndicator())
}

module.exports = { activate }
