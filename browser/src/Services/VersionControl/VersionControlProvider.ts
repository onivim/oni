import { IEvent } from "oni-types"
import { BranchSummary, DiffResult, FetchResult } from "simple-git/promise"

export type VCSBranchChangedEvent = string

export default interface VersionControlProvider {
    // Events
    // onFileStatusChanged: IEvent
    // onStageFilesChanged: IEvent
    onBranchChanged: IEvent<VCSBranchChangedEvent>

    // getHistory(filepath: string): Promise<DiffResult | null>
    getVCSStatus(projectRoot?: string): Promise<DiffResult | void>
    getVCSRoot(): Promise<string | void>
    getVCSBranch(path?: string): Promise<string | void>
    getLocalVCSBranches(path?: string): Promise<BranchSummary>
    changeVCSBranch(branch: string, currentDir: string): Promise<void>
    fetchVCSBranchFromRemote(args: {
        branch: string
        origin?: string
        currentDir: string
    }): Promise<FetchResult>
}
