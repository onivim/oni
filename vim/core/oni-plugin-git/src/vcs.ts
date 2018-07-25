import { IEvent } from "oni-types"
import { BranchSummary, FetchResult } from "simple-git/promise"

export enum Statuses {
    staged,
    committed,
    modified,
}

export type BranchChangedEvent = string
export type StagedFilesChangedEvent = string
export type FileStatusChangedEvent = Array<{
    path: string
    status: Statuses
}>

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
    getLogs(file?: string): Promise<Logs>
    getLocalBranches(): Promise<BranchSummary | void>
    changeBranch(branch: string): Promise<void>
    stageFile(file: string): Promise<void>
    unstage(files: string[]): Promise<void>
    uncommit(sha?: string): Promise<void>
    commitFiles(message: string[], files?: string[]): Promise<Commits>
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

export interface Commits {
    author: null | {
        email: string
        name: string
    }
    branch: string
    commit: string
    summary: {
        changes: number
        insertions: number
        deletions: number
    }
}

export interface DefaultLogFields {
    hash: string
    date: string
    message: string
    author_name: string
    author_email: string
}

export interface ListLogSummary<T = DefaultLogFields> {
    all: ReadonlyArray<T>
    total: number
    latest: T
}

export type Logs = ListLogSummary<DefaultLogFields>
export type Summary = StatusResult
export type SupportedProviders = "git" | "svn"
export default VersionControlProvider
