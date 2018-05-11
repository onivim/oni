import * as capitalize from "lodash/capitalize"
import * as Oni from "oni-api"
import * as React from "react"

import { PluginManager } from "../../Plugins/PluginManager"
import * as Log from "./../../Log"
import { Icon } from "./../../UI/Icon"
import { CommandManager } from "./../CommandManager"
import { Menu, MenuManager } from "./../Menu"
import { IWorkspace } from "./../Workspace"
import VersionControlProvider from "./VersionControlProvider"

interface ICreateIconArgs {
    type: string
    num: number
}

export default class VersionControlManager {
    private _gitInstance: VersionControlProvider
    private _menuInstance: Menu
    private _vcs: "git" | "svn"

    constructor(
        private _workspace: IWorkspace,
        private _editorManager: Oni.EditorManager,
        private _statusBar: Oni.StatusBar,
        private _menu: MenuManager,
        private _commands: CommandManager,
        pluginManager: PluginManager,
    ) {
        pluginManager.pluginsAllLoaded.subscribe(() => {
            this.selectVCSToUse()
            this._gitInstance = pluginManager.getPlugin(`oni-plugin-${this._vcs}`)
            this._updateBranchIndicator()
            this._editorManager.activeEditor.onBufferEnter.subscribe(async () => {
                await this._updateBranchIndicator()
            })

            this._gitInstance.onBranchChanged.subscribe(async newBranch => {
                await this._updateBranchIndicator(newBranch)
                await this._editorManager.activeEditor.neovim.command("e!")
            })

            this._editorManager.activeEditor.onBufferSaved.subscribe(async () => {
                await this._updateBranchIndicator()
            })
            ;(this._workspace as any).onFocusGained.subscribe(async () => {
                await this._updateBranchIndicator()
            })
            this._registerCommands()
        })
    }

    private selectVCSToUse() {
        this._vcs = "git"
        return this._vcs
    }

    private _registerCommands = () => {
        this._commands.registerCommand({
            command: `oni.${this._vcs}.fetch`,
            name: "Fetch the selected branch",
            detail: "",
            execute: () => this._fetchBranch(),
        })

        this._commands.registerCommand({
            command: `oni.${this._vcs}.branches`,
            name: `Local ${capitalize(this._vcs)} Branches`,
            detail: "Open a menu with a list of all local branches",
            execute: () => this._createBranchList(),
        })
    }

    private _updateBranchIndicator = async (branchName?: string) => {
        const vcsId = `oni.status.${this._vcs}`
        const gitBranchIndicator = this._statusBar.createItem(1, vcsId)
        const { filePath } = this._editorManager.activeEditor.activeBuffer

        try {
            const { activeWorkspace: ws } = this._workspace
            const branch = branchName || (await this._gitInstance.getVCSBranch(ws))
            if (!branch) {
                throw new Error("The branch name could not be found")
            }

            const summary = await this._gitInstance.getVCSStatus(ws)
            const deletionsAndInsertions = this._addDeletionsAndInsertions(summary, filePath)

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
            Log.warn(`Oni git plugin encountered an error:  ${e.message}`)
            return gitBranchIndicator.hide()
        }
    }

    private _createGitIcon = ({ type, num }: ICreateIconArgs): JSX.Element | void => {
        if (!num) {
            return
        }

        return (
            <span>
                <span
                    style={{
                        fontSize: "0.7rem",
                        padding: "0 0.15rem",
                        color: type === "plus" ? "green" : "red",
                    }}
                >
                    <Icon name={`${type}-circle`} />
                </span>
                <span style={{ paddingLeft: "0.25rem" }}>{num}</span>
            </span>
        )
    }

    private _addDeletionsAndInsertions = (summary: any, filePath: string) => {
        if (summary && (summary.insertions || summary.deletions)) {
            const { insertions, deletions } = summary

            const [insertionSpan, deletionSpan] = [
                {
                    type: "plus",
                    num: insertions,
                },
                {
                    type: "minus",
                    num: deletions,
                },
            ].map(this._createGitIcon)

            const hasBoth = deletions && insertions
            const spacer = hasBoth && <span>, </span>

            return [insertionSpan, spacer, deletionSpan]
        }
        return []
    }

    private _createBranchList = async () => {
        const { activeWorkspace: ws } = this._workspace

        const [currentBranch, branches] = await Promise.all([
            this._gitInstance.getVCSBranch(ws),
            this._gitInstance.getLocalVCSBranches(ws),
        ])

        this._menuInstance = this._menu.create()
        const branchItems = branches.all.map(branch => ({
            label: branch,
            icon: "code-fork",
            pinned: currentBranch === branch,
        }))

        this._menuInstance.show()
        this._menuInstance.setItems(branchItems)
        this._menuInstance.onItemSelected.subscribe(
            menuItem =>
                menuItem && menuItem.label && this._gitInstance.changeVCSBranch(menuItem.label, ws),
        )
    }

    private _fetchBranch = async () => {
        const { activeWorkspace: ws } = this._workspace
        if (this._menuInstance.isOpen() && this._menuInstance.selectedItem) {
            const res = await this._gitInstance.fetchVCSBranchFromRemote({
                currentDir: ws,
                branch: this._menuInstance.selectedItem.label,
            })
            console.log("res: ", res) //tslint:disable-line
        }
    }
}

export const activate = (
    workspace: IWorkspace,
    editorManager: Oni.EditorManager,
    statusBar: Oni.StatusBar,
    pluginManager: PluginManager,
    commands: CommandManager,
    menu: MenuManager,
) => new VersionControlManager(workspace, editorManager, statusBar, menu, commands, pluginManager)
