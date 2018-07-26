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
            this._handleVCSError(e, `find vcs root`)
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
        } catch (e) {
            this._handleVCSError(e, "get current status")
        }
    }

    public getBlame = async (args: VCS.BlameArgs) => {
        try {
            const cmd = [
                "--no-pager",
                "blame",
                "--porcelain",
                args.file,
                "--show-number",
                "-L",
                `${args.lineOne},${args.lineTwo}`,
            ]
            const rawOutput = await this._git(this._projectRoot).raw(cmd)
            console.log("rawOutput: ", rawOutput)
            return this._formatRawBlame(rawOutput)
        } catch (e) {
            this._oni.log.warn(e)
            return null
        }
    }

    public unstage = async (files: string[]) => {
        const flags = ["HEAD", ...files]
        try {
            await this._git(this._projectRoot).reset(flags)
            const changed = files.map(path => ({ path, status: VCS.Statuses.modified }))
            this._onFileStatusChanged.dispatch(changed)
        } catch (e) {
            this._handleVCSError(e, "unstage the file")
        }
    }

    public uncommit = async (sha?: string) => {
        try {
            await this._git(this._projectRoot).reset(["--soft", "HEAD^"])
            this._onFileStatusChanged.dispatch()
        } catch (e) {
            this._handleVCSError(e, "undo most recent commit")
        }
    }

    public getLogs = async (file?: string): Promise<VCS.Logs> => {
        try {
            // n - represents the number of logs to get alternative is to use ["--max-count=25"]
            const options = { file, n: 25 }
            return this._git(this._projectRoot).log(options)
        } catch (e) {
            this._handleVCSError(e, "get logs")
        }
    }

    public getDiff = async () => {
        try {
            return this._git(this._projectRoot).diffSummary()
        } catch (e) {
            this._handleVCSError(e, "get current status")
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
            this._handleVCSError(e, "commit files")
        }
    }

    public stageFile = async (file: string) => {
        try {
            await this._git(this._projectRoot).add(file)
            this._onStagedFilesChanged.dispatch(file)
            this._onFileStatusChanged.dispatch([{ path: file, status: VCS.Statuses.staged }])
        } catch (e) {
            this._handleVCSError(e, `add ${file}`)
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
            this._handleVCSError(e, "to fetch branch")
        }
    }

    public getLocalBranches = async () => {
        try {
            return this._git(this._projectRoot).branchLocal()
        } catch (e) {
            this._handleVCSError(e, "get local branches")
        }
    }

    public getBranch = async (): Promise<string | void> => {
        try {
            const status = await this._git(this._projectRoot).status()
            return status.current
        } catch (e) {
            this._handleVCSError(e, "get current status")
        }
    }

    public async changeBranch(targetBranch: string) {
        try {
            await this._git(this._projectRoot).checkout(targetBranch)
            this._onBranchChange.dispatch(targetBranch)
        } catch (e) {
            this._handleVCSError(e, "change branch")
        }
    }

    private _handleVCSError(error: Error, attemptedAction: string) {
        this._oni.log.warn(error)
        throw new Error(
            `[Oni Git Provider]: Unable to ${attemptedAction} because: ${error.message}`,
        )
    }

    private _formatRawBlame(rawOutput: string): VCS.Blame {
        const firstSpace = (str: string) => str.indexOf(" ")
        const blameArray = rawOutput.split("\n")
        const formatted = blameArray
            .map(line => [line.substr(0, firstSpace(line)), line.substr(firstSpace(line) + 1)])
            .reduce<VCS.Blame>(
                (acc, [key, value], index) => {
                    const formattedKey = key.replace("-", "_")
                    if (!index) {
                        acc.hash = formattedKey
                        const [originalLine, finalLine, numberOfLines] = value.split(" ")
                        acc.line = {
                            originalLine,
                            finalLine,
                            numberOfLines,
                        }
                        return acc
                    } else if (!key) {
                        return acc
                    }
                    acc[formattedKey] = value
                    return acc
                },
                {} as VCS.Blame,
            )
        console.log("formatted: ", formatted)
        return formatted
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
