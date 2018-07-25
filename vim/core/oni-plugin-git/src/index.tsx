/**
 * Git.ts
 *
 */

import * as Oni from "oni-api"
import { Event, IEvent } from "oni-types"
import * as GitP from "simple-git/promise"

import * as VCS from "./vcs" // TODO: import from oni-api

interface FileSummary {
    index: string
    path: string
    working_dir: string
}

export class GitVersionControlProvider implements VCS.VersionControlProvider {
    private readonly _name = "git"
    private _onPluginActivated = new Event<void>("Oni::VCSPluginActivated")
    private _onPluginDeactivated = new Event<void>("Oni::VCSPluginDeactivated")
    private _onBranchChange = new Event<VCS.BranchChangedEvent>("Oni::VCSBranchChanged")
    private _onStagedFilesChanged = new Event<VCS.StagedFilesChangedEvent>(
        "Oni::VCSStagedFilesChanged",
    )
    private _onFileStatusChanged = new Event<VCS.FileStatusChangedEvent>(
        "Oni::VCSFilesStatusChanged",
    )
    private _isActivated = false
    private _projectRoot: string

    constructor(private _oni: Oni.Plugin.Api, private _git = GitP) {
        this._projectRoot = this._oni.workspace.activeWorkspace
        this._oni.workspace.onDirectoryChanged.subscribe(workspace => {
            this._projectRoot = workspace
        })
    }

    get onBranchChanged(): IEvent<VCS.BranchChangedEvent> {
        return this._onBranchChange
    }

    get onFileStatusChanged(): IEvent<VCS.FileStatusChangedEvent> {
        return this._onFileStatusChanged
    }

    get onStagedFilesChanged(): IEvent<VCS.StagedFilesChangedEvent> {
        return this._onStagedFilesChanged
    }

    get onPluginActivated(): IEvent<void> {
        return this._onPluginActivated
    }

    get onPluginDeactivated(): IEvent<void> {
        return this._onPluginDeactivated
    }

    get isActivated(): boolean {
        return this._isActivated
    }

    get name(): VCS.SupportedProviders {
        return this._name
    }

    public activate() {
        this._isActivated = true
        this._onPluginActivated.dispatch()
    }

    public deactivate() {
        this._isActivated = false
        this._onPluginDeactivated.dispatch()
    }

    public async canHandleWorkspace(dir?: string) {
        try {
            return this._git(this._projectRoot)
                .silent()
                .checkIsRepo()
        } catch (e) {
            this._oni.log.warn(
                `Git provider was unable to check if this directory is a repository because ${
                    e.message
                }`,
            )
            return false
        }
    }

    public async getRoot() {
        try {
            return this._git(this._projectRoot).revparse(["--show-toplevel"])
        } catch (e) {
            this._oni.log.warn(`Git provider unable to find vcs root due to ${e.message}`)
        }
    }

    public getStatus = async (): Promise<VCS.StatusResult | void> => {
        try {
            const status = await this._git(this._projectRoot).status()
            const { modified, staged } = this._getModifiedAndStaged(status.files)
            return {
                staged,
                modified,
                ahead: status.ahead,
                behind: status.behind,
                created: status.created,
                deleted: status.deleted,
                currentBranch: status.current,
                conflicted: status.conflicted,
                untracked: status.not_added,
                remoteTrackingBranch: status.tracking,
            }
        } catch (error) {
            this._oni.log.warn(
                `Git provider unable to get current status because of: ${error.message}`,
            )
        }
    }

    public getDiff = async () => {
        try {
            return this._git(this._projectRoot).diffSummary()
        } catch (e) {
            const error = `Git provider unable to get current status because of: ${e.message}`
            this._oni.log.warn(error)
            throw new Error(error)
        }
    }

    public commitFiles = async (message: string[], files?: string[]): Promise<VCS.Commits> => {
        try {
            const commit = this._git(this._projectRoot).commit(message, files)
            const changed = (files || []).map(file => ({
                path: file,
                status: VCS.Statuses.committed,
            }))
            this._onFileStatusChanged.dispatch(changed)
            return commit
        } catch (e) {
            this._oni.log.warn(e.warn)
            throw new Error(e)
        }
    }

    public stageFile = async (file: string, dir?: string) => {
        try {
            await this._git(this._projectRoot).add(file)
            this._onStagedFilesChanged.dispatch(file)
            this._onFileStatusChanged.dispatch([{ path: file, status: VCS.Statuses.staged }])
        } catch (e) {
            const error = `Git provider unable to add ${file} because ${e.message}`
            this._oni.log.warn(error)
            throw new Error(error)
        }
    }

    public fetchBranchFromRemote = async ({
        branch,
        currentDir,
        remote = null,
    }: {
        branch: string
        remote: string
        currentDir: string
    }) => {
        try {
            return this._git(this._projectRoot).fetch(remote, branch)
        } catch (e) {
            const error = `Git provider unable to fetch branch because of: ${e.message}`
            this._oni.log.warn(error)
            throw new Error(error)
        }
    }

    public getLocalBranches = async () => {
        try {
            return this._git(this._projectRoot).branchLocal()
        } catch (e) {
            const error = `Git provider unable to get local branches because of: ${e.message}`
            this._oni.log.warn(error)
            throw new Error(error)
        }
    }

    public getBranch = async (): Promise<string | void> => {
        try {
            const status = await this._git(this._projectRoot).status()
            return status.current
        } catch (e) {
            const error = `Git Provider was unable to get current status because of: ${e.message}`
            this._oni.log.warn(error)
            throw new Error(error)
        }
    }

    public async changeBranch(targetBranch: string) {
        try {
            await this._git(this._projectRoot).checkout(targetBranch)
            this._onBranchChange.dispatch(targetBranch)
        } catch (e) {
            const error = `Git Provider was unable change branch because of: ${e.message}`
            this._oni.log.warn(error)
            throw new Error(error)
        }
    }

    private _isStaged = (file: FileSummary) => {
        const GitPIndicators = ["M", "A"]
        return GitPIndicators.some(status => file.index.includes(status))
    }

    private _getModifiedAndStaged(files: FileSummary[]): { modified: string[]; staged: string[] } {
        return files.reduce(
            (acc, file) => {
                if (file.working_dir === "M") {
                    acc.modified.push(file.path)
                } else if (this._isStaged(file)) {
                    acc.staged.push(file.path)
                }
                return acc
            },
            { modified: [], staged: [] },
        )
    }
}

export const activate = async oni => {
    const provider = new GitVersionControlProvider(oni)
    await oni.services.vcs.registerProvider(provider)

    return provider
}
