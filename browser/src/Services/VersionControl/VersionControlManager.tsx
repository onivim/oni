import * as capitalize from "lodash/capitalize"
import * as Oni from "oni-api"
import * as React from "react"

import { PluginManager } from "../../Plugins/PluginManager"
import * as Log from "./../../Log"
import { CommandManager } from "./../CommandManager"
import { Menu, MenuManager } from "./../Menu"
import { IWorkspace } from "./../Workspace"
import { Branch, VCSIcon } from "./VCSComponents"
import VersionControlProvider from "./VersionControlProvider"

export default class VersionControlManager {
    private _vcsProvider: VersionControlProvider
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
            this._vcsProvider = pluginManager.getPlugin(`oni-plugin-${this._vcs}`)
            this._updateBranchIndicator()
            this._editorManager.activeEditor.onBufferEnter.subscribe(async () => {
                await this._updateBranchIndicator()
            })

            this._vcsProvider.onBranchChanged.subscribe(async newBranch => {
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
        // TODO: add logic here to select the correct VCS
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
        const branchIndicator = this._statusBar.createItem(1, vcsId)
        const { filePath } = this._editorManager.activeEditor.activeBuffer

        try {
            const { activeWorkspace: ws } = this._workspace
            const branch = branchName || (await this._vcsProvider.getVCSBranch(ws))
            if (!branch) {
                throw new Error("The branch name could not be found")
            }

            const summary = await this._vcsProvider.getVCSStatus(ws)
            const deletionsAndInsertions = this._addDeletionsAndInsertions(summary, filePath)

            branchIndicator.setContents(<Branch branch={branch}>{deletionsAndInsertions}</Branch>)
            branchIndicator.show()
        } catch (e) {
            Log.warn(`Oni ${this._vcs} plugin encountered an error:  ${e.message}`)
            return branchIndicator.hide()
        }
    }

    private _addDeletionsAndInsertions = (summary: any, filePath: string) => {
        if (summary && (summary.insertions || summary.deletions)) {
            const { insertions, deletions } = summary
            const hasBoth = deletions && insertions
            return [
                <VCSIcon type="plus" num={insertions} />,
                hasBoth && <span>, </span>,
                <VCSIcon type="minus" num={deletions} />,
            ]
        }
        return []
    }

    private _createBranchList = async () => {
        const { activeWorkspace: ws } = this._workspace

        const [currentBranch, branches] = await Promise.all([
            this._vcsProvider.getVCSBranch(ws),
            this._vcsProvider.getLocalVCSBranches(ws),
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
                menuItem && menuItem.label && this._vcsProvider.changeVCSBranch(menuItem.label, ws),
        )
    }

    private _fetchBranch = async () => {
        const { activeWorkspace: ws } = this._workspace
        if (this._menuInstance.isOpen() && this._menuInstance.selectedItem) {
            await this._vcsProvider.fetchVCSBranchFromRemote({
                currentDir: ws,
                branch: this._menuInstance.selectedItem.label,
            })
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
