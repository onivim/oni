import * as Oni from "oni-api"
import * as React from "react"

import { PluginManager } from "../../Plugins/PluginManager"
import { Icon } from "./../../UI/Icon"
import { IWorkspace } from "./../Workspace"

export default class VersionControlManager {
    private _gitInstance: any
    constructor(
        private _workspace: IWorkspace,
        private _editorManager: Oni.EditorManager,
        private _statusBar: Oni.StatusBar,
        pluginManager: PluginManager,
    ) {
        this._gitInstance = pluginManager.getPlugin("oni.plugin.git")
        console.log("this._gitInstance: ", this._gitInstance)
    }

    public updateBranchIndicator = async (branchName: string) => {
        const gitId = "oni.status.git"
        const gitBranchIndicator = this._statusBar.createItem(1, gitId)
        const { filePath } = this._editorManager.activeEditor.activeBuffer

        try {
            const { activeWorkspace: ws } = this._workspace
            const branch = branchName || (await this._gitInstance.getVCSBranch(ws))
            if (!branch) {
                throw new Error("The branch name could not be found")
            }
            const summary = await this._gitInstance.getVCSStatus(ws)

            const deletionsAndInsertions = this.addDeletionsAndInsertions(summary, filePath)

            const gitBranch = (
                <div
                    style={{
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <span
                        style={{
                            minWidth: "10px",
                            textAlign: "center",
                            padding: "2px 4px 0 0",
                        }}
                    >
                        <Icon name="code-fork" />
                        <div style={{ width: "100%" }}>
                            {[`${branch} `, ...deletionsAndInsertions]}
                        </div>
                    </span>
                </div>
            )
            gitBranchIndicator.setContents(gitBranch)
            gitBranchIndicator.show()
        } catch (e) {
            // tslint:disable-next-line
            console.log("Oni git plugin encountered an error: ", e)
            return gitBranchIndicator.hide()
        }
    }

    public createGitIcon = ({
        style,
        type,
        num,
    }: {
        style: React.CSSProperties
        type: string
        num: number
    }): JSX.Element | void => {
        if (!num) {
            return
        }

        return (
            <span>
                <span style={style}>
                    <Icon name={`${type}-circle`} />
                </span>
                <span style={{ paddingLeft: "0.25rem" }}>{num}</span>
            </span>
        )
    }

    public addDeletionsAndInsertions = (summary: any, filePath: string) => {
        if (summary && (summary.insertions || summary.deletions)) {
            const { insertions, deletions } = summary

            const [insertionSpan, deletionSpan] = [
                {
                    type: "plus",
                    num: insertions,
                    style: { fontSize: "0.7rem", padding: "0 0.15rem", color: "green" },
                },
                {
                    type: "minus",
                    num: deletions,
                    style: { fontSize: "0.7rem", padding: "0 0.15rem", color: "red" },
                },
            ].map(this.createGitIcon)

            const hasBoth = deletions && insertions
            const spacer = hasBoth && <span>, </span>

            return [insertionSpan, spacer, deletionSpan]
        }
        return []
    }
}

export const activate = (
    workspace: IWorkspace,
    editorManager: Oni.EditorManager,
    statusBar: Oni.StatusBar,
    pluginManager: PluginManager,
) => new VersionControlManager(workspace, editorManager, statusBar, pluginManager)

// const createBranchList = async Oni => {
//     const { workspace: { activeWorkspace: ws } } = Oni
//
//     const [currentBranch, branches] = await Promise.all([
//         Oni.services.git.getVCSBranch(ws),
//         Oni.services.git.getLocalVCSBranches(ws),
//     ])
//
//     const menu = Oni.menu.create()
//     const branchItems = branches.all.map(branch => ({
//         label: branch,
//         icon: branchIcon,
//         pinned: currentBranch === branch,
//     }))
//
//     menu.show()
//     menu.setItems(branchItems)
//     menu.onItemSelected.subscribe(
//         menuItem =>
//         menuItem && menuItem.label && Oni.services.git.changeVCSBranch(menuItem.label, ws),
//     )
//
//     const fetchBranch = async (Oni, menu) => {
//         if (menu.isOpen() && menu.selectedItem) {
//             const res = await Oni.services.git.fetchVCSBranchFromRemote({
//                 currentDir: ws,
//                 branch: menu.selectedItem.label,
//             })
//             console.log("res: ", res)
//         }
//     }
//
//     Oni.commands.registerCommand({
//         command: "oni.git.fetch",
//         name: "Fetch the selected branch",
//         execute: () => fetchBranch(Oni, menu),
//     })
// }
//
// Oni.commands.registerCommand({
//     command: "oni.git.branches",
//     name: "Local Git Branches",
//     detail: "Open a menu with a list of all local branches",
//     execute: () => createBranchList(Oni),
// })
//
//
//
// updateBranchIndicator()
//
// editorManager.activeEditor.onBufferEnter.subscribe(async () => await updateBranchIndicator())
//
// this._gitInstance.onBranchChanged.subscribe(async newBranch => {
//     await this.updateBranchIndicator(newBranch)
//     await this._editorManager.activeEditor.neovim.command("e!")
// })
//
// this._editorManager.activeEditor.onBufferSaved.subscribe(async () => await updateBranchIndicator())
// this._workspace.onFocusGained.subscribe(async () => await updateBranchIndicator())
