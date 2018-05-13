import { IEvent } from "oni-types"
import { BranchSummary, DiffResult, FetchResult } from "simple-git/promise"

export type VCSBranchChangedEvent = string
export type VCSStagedFilesChangedEvent = string
export type VCSFileStatusChangedEvent = string

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

export default interface VersionControlProvider {
    // Events
    onFileStatusChanged: IEvent<VCSFileStatusChangedEvent>
    onStagedFilesChanged: IEvent<VCSStagedFilesChangedEvent>
    onBranchChanged: IEvent<VCSBranchChangedEvent>

    canHandleWorkspace(dir?: string): Promise<boolean>
    getStatus(projectRoot?: string): Promise<StatusResult | void>
    getRoot(): Promise<string | void>
    getDiff(projectRoot?: string): Promise<DiffResult | void>
    getBranch(path?: string): Promise<string | void>
    getLocalBranches(path?: string): Promise<BranchSummary | void>
    changeBranch(branch: string, currentDir: string): Promise<void>
    stageFile(file: string, projectRoot?: string): Promise<void>
    fetchBranchFromRemote(args: {
        branch: string
        origin?: string
        currentDir: string
    }): Promise<FetchResult>
}

export type Diff = DiffResult
export type Summary = StatusResult
export type SupportedProviders = "git" | "svn"
