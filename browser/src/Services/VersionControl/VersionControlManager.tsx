import * as capitalize from "lodash/capitalize"
import * as Oni from "oni-api"
import { IDisposable } from "oni-types"
import * as React from "react"

import { SupportedProviders, VersionControlPane, VersionControlProvider } from "./"
import * as Log from "./../../Log"
import { MenuManager } from "./../Menu"
import { SidebarManager } from "./../Sidebar"
import { IWorkspace } from "./../Workspace"
import { Branch } from "./VersionControlComponents"

export class VersionControlManager {
    private _vcs: SupportedProviders
    private _vcsProvider: VersionControlProvider
    private _menuInstance: Oni.Menu.MenuInstance
    private _vcsStatusItem: Oni.StatusBarItem
    private _subscriptions: IDisposable[]

    constructor(
        private _workspace: IWorkspace,
        private _editorManager: Oni.EditorManager,
        private _statusBar: Oni.StatusBar,
        private _menu: MenuManager,
        private _commands: Oni.Commands.Api,
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

    public unregisterProvider(): void {
        this._subscriptions.map(s => s.dispose())
        this._vcsStatusItem.hide()
        this._vcsStatusItem.dispose()
        this._vcsProvider = null
        this._vcs = null
    }

    private _initialize() {
        this._updateBranchIndicator()

        const s1 = this._editorManager.activeEditor.onBufferEnter.subscribe(async () => {
            await this._updateBranchIndicator()
        })

        const s2 = this._vcsProvider.onBranchChanged.subscribe(async newBranch => {
            await this._updateBranchIndicator(newBranch)
            await this._editorManager.activeEditor.neovim.command("e!")
        })

        const s3 = this._editorManager.activeEditor.onBufferSaved.subscribe(async () => {
            await this._updateBranchIndicator()
        })
        const s4 = (this._workspace as any).onFocusGained.subscribe(async () => {
            await this._updateBranchIndicator()
        })

        const vcsPane = new VersionControlPane(this._workspace, this._vcsProvider, this._vcs)
        const hasSidebar = this._sidebar.entries.some(({ id }) => id === vcsPane.id)

        if (!hasSidebar) {
            this._sidebar.add("code-fork", vcsPane)
        }

        this._subscriptions = [s1, s2, s3, s4]
        this._registerCommands()
    }

    private _registerCommands = () => {
        this._commands.registerCommand({
            command: `oni.${this._vcs}.fetch`,
            name: "Fetch the selected branch",
            detail: "",
            execute: this._fetchBranch,
        })

        this._commands.registerCommand({
            command: `oni.${this._vcs}.branches`,
            name: `Local ${capitalize(this._vcs)} Branches`,
            detail: "Open a menu with a list of all local branches",
            execute: this._createBranchList,
        })
    }

    private _updateBranchIndicator = async (branchName?: string) => {
        if (!this._vcsProvider) {
            return
        }
        const vcsId = `oni.status.${this._vcs}`
        this._vcsStatusItem = this._statusBar.createItem(1, vcsId)

        try {
            const branch =
                branchName || (await this._vcsProvider.getBranch(this._workspace.activeWorkspace))

            const diff = await this._vcsProvider.getDiff(this._workspace.activeWorkspace)

            if (!branch) {
                throw new Error("The branch name could not be found")
            } else if (!diff) {
                Log.info("A diff of the current directory couldn't be found")
            }

            // TODO: disable repeated enter animations of this status item
            this._vcsStatusItem.setContents(<Branch branch={branch} diff={diff} />)
            this._vcsStatusItem.show()
        } catch (e) {
            Log.warn(`Oni ${this._vcs} plugin encountered an error:  ${e.message}`)
            return this._vcsStatusItem.hide()
        }
    }

    private _createBranchList = async () => {
        if (!this._vcsProvider) {
            return
        }
        const [currentBranch, branches] = await Promise.all([
            this._vcsProvider.getBranch(this._workspace.activeWorkspace),
            this._vcsProvider.getLocalBranches(this._workspace.activeWorkspace),
        ])

        this._menuInstance = this._menu.create()

        if (!branches) {
            return
        }

        const branchItems = branches.all.map(branch => ({
            label: branch,
            icon: "code-fork",
            pinned: currentBranch === branch,
        }))

        this._menuInstance.show()
        this._menuInstance.setItems(branchItems)

        this._menuInstance.onItemSelected.subscribe(menuItem => {
            if (menuItem && menuItem.label) {
                this._vcsProvider.changeBranch(menuItem.label, this._workspace.activeWorkspace)
            }
        })
    }

    private _fetchBranch = async () => {
        if (this._menuInstance.isOpen() && this._menuInstance.selectedItem) {
            await this._vcsProvider.fetchBranchFromRemote({
                currentDir: this._workspace.activeWorkspace,
                branch: this._menuInstance.selectedItem.label,
            })
        }
    }
}

// Shelter the instance from the global scope -> globals are evil.
function init() {
    let Provider: VersionControlManager

    const Activate = (
        workspace: IWorkspace,
        editorManager: Oni.EditorManager,
        statusBar: Oni.StatusBar,
        commands: Oni.Commands.Api,
        menu: MenuManager,
        sidebar: SidebarManager,
    ): void => {
        Provider = new VersionControlManager(
            workspace,
            editorManager,
            statusBar,
            menu,
            commands,
            sidebar,
        )
    }

    const GetInstance = () => {
        return Provider
    }

    return {
        activate: Activate,
        getInstance: GetInstance,
    }
}

export const { activate, getInstance } = init()
