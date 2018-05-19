import * as capitalize from "lodash/capitalize"
import * as Oni from "oni-api"
import { IDisposable } from "oni-types"
import * as React from "react"

import { SupportedProviders, VersionControlPane, VersionControlProvider } from "./"
import * as Log from "./../../Log"
import { Branch } from "./../../UI/components/VersionControl"
import { MenuManager } from "./../Menu"
import { SidebarManager } from "./../Sidebar"
import { IWorkspace } from "./../Workspace"

export class VersionControlManager {
    private _vcs: SupportedProviders
    private _vcsProvider: VersionControlProvider
    private _menuInstance: Oni.Menu.MenuInstance
    private _vcsStatusItem: Oni.StatusBarItem
    private _subscriptions: IDisposable[]
    private _providers = new Map<string, VersionControlProvider>()

    constructor(
        private _workspace: IWorkspace,
        private _editorManager: Oni.EditorManager,
        private _statusBar: Oni.StatusBar,
        private _menu: MenuManager,
        private _commands: Oni.Commands.Api,
        private _sidebar: SidebarManager,
    ) {}

    public async registerProvider(provider: VersionControlProvider): Promise<void> {
        if (provider) {
            this._providers.set(provider.name, provider)
            if (await provider.canHandleWorkspace(this._workspace.activeWorkspace)) {
                this._activateVCSProvider(provider)
            }

            this._workspace.onDirectoryChanged.subscribe(async dir => {
                const providerToUse = await this.getCompatibleProvider(dir)
                this.handleProviderStatus(providerToUse)
            })
        }
    }

    public deactivateProvider(): void {
        this._vcsProvider.deactivate()
        this._subscriptions.map(s => s.dispose())
        this._vcsStatusItem.hide()
        this._vcsStatusItem.dispose()
        this._vcsProvider = null
        this._vcs = null
    }

    public handleProviderStatus(providerToUse: VersionControlProvider): void {
        const isSameProvider =
            this._vcsProvider && providerToUse && this._vcsProvider.name === providerToUse.name

        if (isSameProvider) {
            return
        } else if (this._vcsProvider && !providerToUse) {
            this.deactivateProvider()
        } else if (this._vcsProvider && providerToUse) {
            this.deactivateProvider()
            this._activateVCSProvider(providerToUse)
        } else if (!this._vcsProvider && providerToUse) {
            this._activateVCSProvider(providerToUse)
        }
    }

    private async getCompatibleProvider(dir: string): Promise<VersionControlProvider | null> {
        const allCompatibleProviders: VersionControlProvider[] = []
        for (const vcs of this._providers.values()) {
            const isCompatible = await vcs.canHandleWorkspace(dir)
            if (isCompatible) {
                allCompatibleProviders.push(vcs)
            }
        }
        // TODO: when we have multiple providers we will need logic to determine which to
        // use if more than one is compatible
        const [providerToUse] = allCompatibleProviders

        return providerToUse
    }

    private _activateVCSProvider = async (provider: VersionControlProvider) => {
        this._vcs = provider.name
        this._vcsProvider = provider
        this._initialize()
        provider.activate()
    }

    private _initialize() {
        this._updateBranchIndicator()

        const subscriptions = [
            this._editorManager.activeEditor.onBufferEnter.subscribe(async () => {
                await this._updateBranchIndicator()
            }),
            this._vcsProvider.onBranchChanged.subscribe(async newBranch => {
                await this._updateBranchIndicator(newBranch)
                await this._editorManager.activeEditor.neovim.command("e!")
            }),
            this._editorManager.activeEditor.onBufferSaved.subscribe(async () => {
                await this._updateBranchIndicator()
            }),
            (this._workspace as any).onFocusGained.subscribe(async () => {
                await this._updateBranchIndicator()
            }),
        ]

        this._subscriptions = subscriptions
        const hasVcsSidebar = this._sidebar.entries.some(({ id }) => id.includes("vcs"))

        if (!hasVcsSidebar) {
            const vcsPane = new VersionControlPane(this._workspace, this._vcsProvider, this._vcs)
            this._sidebar.add("code-fork", vcsPane)
        }

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
            }
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
