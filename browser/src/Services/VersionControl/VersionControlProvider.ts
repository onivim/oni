import { IEvent } from "oni-types"
import { BranchSummary, FetchResult } from "simple-git/promise"

export type BranchChangedEvent = string
export type StagedFilesChangedEvent = string
export interface FileStatusChangedEvent {
    path: string
    status: "staged"
}

export interface StatusResult {
    ahead: number
    behind: number
    currentBranch: string
    modified: string[]
    staged: string[]
    conflicted: string[]
    created: string[]
    deleted: string[]
    untracked: string[]
    remoteTrackingBranch: string
}

export interface VersionControlProvider {
    // Events
    onFileStatusChanged: IEvent<FileStatusChangedEvent>
    onStagedFilesChanged: IEvent<StagedFilesChangedEvent>
    onBranchChanged: IEvent<BranchChangedEvent>
    onPluginActivated: IEvent<void>
    onPluginDeactivated: IEvent<void>

    name: SupportedProviders
    isActivated: boolean
    deactivate(): void
    activate(): void
    canHandleWorkspace(dir?: string): Promise<boolean>
    getStatus(): Promise<StatusResult | void>
    getRoot(): Promise<string | void>
    getDiff(): Promise<Diff | void>
    getBranch(): Promise<string | void>
    getLocalBranches(): Promise<BranchSummary | void>
    changeBranch(branch: string): Promise<void>
    stageFile(file: string, projectRoot?: string): Promise<void>
    fetchBranchFromRemote(args: {
        branch: string
        origin?: string
        currentDir: string
    }): Promise<FetchResult>
}

export interface DiffResultTextFile {
    file: string
    changes: number
    insertions: number
    deletions: number
    binary: boolean
}

export interface DiffResultBinaryFile {
    file: string
    before: number
    after: number
    binary: boolean
}

export interface Diff {
    files: Array<DiffResultTextFile | DiffResultBinaryFile>
    insertions: number
    deletions: number
}

export type Summary = StatusResult
export type SupportedProviders = "git" | "svn"

export default VersionControlProvider
