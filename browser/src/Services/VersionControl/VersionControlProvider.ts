import { IEvent } from "oni-types"
import { BranchSummary, DiffResult, FetchResult } from "simple-git/promise"

export type VCSBranchChangedEvent = string

export default interface VersionControlProvider {
    // Events
    // onFileStatusChanged: IEvent
    // onStageFilesChanged: IEvent
    onBranchChanged: IEvent<VCSBranchChangedEvent>

    getStatus(projectRoot?: string): Promise<DiffResult | void>
    getRoot(): Promise<string | void>
    getBranch(path?: string): Promise<string | void>
    getLocalBranches(path?: string): Promise<BranchSummary>
    changeBranch(branch: string, currentDir: string): Promise<void>
    stageFile(file: string, projectRoot?: string): Promise<void>
    fetchBranchFromRemote(args: {
        branch: string
        origin?: string
        currentDir: string
    }): Promise<FetchResult>
}

export type Summary = DiffResult
export type SupportedProviders = "git" | "svn"
