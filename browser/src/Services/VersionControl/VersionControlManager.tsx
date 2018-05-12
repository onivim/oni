import * as capitalize from "lodash/capitalize"
import * as Oni from "oni-api"
import * as React from "react"

import { Summary, SupportedProviders, VersionControlPane, VersionControlProvider } from "./"
import * as Log from "./../../Log"
import { CommandManager } from "./../CommandManager"
import { Menu, MenuManager } from "./../Menu"
import { SidebarManager } from "./../Sidebar"
import { IWorkspace } from "./../Workspace"
import { Branch, VCSIcon } from "./VersionControlComponents"

export class VersionControlManager {
    private _vcsProvider: VersionControlProvider
    private _menuInstance: Menu
    private _vcs: SupportedProviders
    private _currentBranch: string | void

    constructor(
        private _workspace: IWorkspace,
        private _editorManager: Oni.EditorManager,
        private _statusBar: Oni.StatusBar,
        private _menu: MenuManager,
        private _commands: CommandManager,
        private _sidebar: SidebarManager,
    ) {}

    public registerProvider({
        provider,
        name,
    }: {
        provider: VersionControlProvider
        name: SupportedProviders
    }): void {
        if (provider) {
            this._vcs = name
            this._vcsProvider = provider
            this._initialize()
        }
    }

    private _initialize() {
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

        this._sidebar.add(
            "code-fork",
            new VersionControlPane(this._workspace, this._vcsProvider, this._vcs),
        )
        this._registerCommands()
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
            const branch = await this._vcsProvider.getBranch(ws)
            const isSameBranch =
                this._currentBranch &&
                (this._currentBranch === branchName || this._currentBranch === branch)

            if (isSameBranch) {
                return
            }

            this._currentBranch = branchName || branch
            const summary = await this._vcsProvider.getStatus(ws)
            if (!this._currentBranch || !summary) {
                throw new Error("The branch name could not be found")
            }

            const deletionsAndInsertions = this._addDeletionsAndInsertions(summary, filePath)

            branchIndicator.setContents(
                <Branch branch={this._currentBranch}>{deletionsAndInsertions}</Branch>,
            )
            branchIndicator.show()
        } catch (e) {
            Log.warn(`Oni ${this._vcs} plugin encountered an error:  ${e.message}`)
            return branchIndicator.hide()
        }
    }

    private _addDeletionsAndInsertions = (summary: Summary, filePath: string) => {
        if (summary && (summary.insertions || summary.deletions)) {
            const { insertions, deletions } = summary
            const hasBoth = deletions && insertions
            return [
                <VCSIcon key={1} type="addition" num={insertions} />,
                hasBoth && <span key={2}>, </span>,
                <VCSIcon key={3} type="deletion" num={deletions} />,
            ]
        }
        return []
    }

    private _createBranchList = async () => {
        const { activeWorkspace: ws } = this._workspace

        const [currentBranch, branches] = await Promise.all([
            this._vcsProvider.getBranch(ws),
            this._vcsProvider.getLocalBranches(ws),
        ])

        this._menuInstance = this._menu.create()
        const branchItems = branches.all.map(branch => ({
            label: branch,
            icon: "code-fork",
            pinned: currentBranch === branch,
        }))

        this._menuInstance.show()
        this._menuInstance.setItems(branchItems)
        this._menuInstance.onItemSelected.subscribe(menuItem => {
            if (menuItem && menuItem.label) {
                this._vcsProvider.changeBranch(menuItem.label, ws)
            }
        })
    }

    private _fetchBranch = async () => {
        const { activeWorkspace: ws } = this._workspace
        if (this._menuInstance.isOpen() && this._menuInstance.selectedItem) {
            await this._vcsProvider.fetchBranchFromRemote({
                currentDir: ws,
                branch: this._menuInstance.selectedItem.label,
            })
        }
    }
}

let Provider: VersionControlManager

export const activate = (
    workspace: IWorkspace,
    editorManager: Oni.EditorManager,
    statusBar: Oni.StatusBar,
    commands: CommandManager,
    menu: MenuManager,
    sidebar: SidebarManager,
) =>
    (Provider = new VersionControlManager(
        workspace,
        editorManager,
        statusBar,
        menu,
        commands,
        sidebar,
    ))

export const getInstance = () => {
    return Provider
}
