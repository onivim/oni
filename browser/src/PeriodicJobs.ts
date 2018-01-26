import * as Constants from "./Constants"
import * as Log from "./Log"

// IPeriodicJob implements the interface for a long-running job
// that would be expensive to run synchronously, so it is
// spread across multiple asynchronous iterations.
export interface IPeriodicJob {
    // Execute should return `true` if the job is complete,
    // false otherwise
    execute(): boolean
}

export class PeriodicJobManager {
    private _currentScheduledJob: number = null
    private _pendingJobs: IPeriodicJob[] = []

    public startJob(job: IPeriodicJob) {
        this._pendingJobs.push(job)
        Log.verbose("[PeriodicJobManager]::startJob - " + this._pendingJobs.length + " total jobs.")
        this._scheduleJobs()
    }

    private _scheduleJobs(): void {
        if (this._currentScheduledJob) {
            return
        }

        if (this._pendingJobs.length === 0) {
            Log.verbose("[PeriodicJobManager]::_scheduleJobs - no jobs pending.")
        }

        this._currentScheduledJob = window.setTimeout(() => {
            const completed = this._executePendingJobs()
            window.clearTimeout(this._currentScheduledJob)
            this._currentScheduledJob = null

            if (!completed) {
                this._scheduleJobs()
            }
        }, Constants.Delay.INSTANT)

        Log.verbose("[PeriodicJobManager]::_scheduleJobs - " + this._currentScheduledJob)
    }

    private _executePendingJobs(): boolean {
        const completedJobs: IPeriodicJob[] = []
        this._pendingJobs.forEach(job => {
            const completed = job.execute()

            if (completed) {
                completedJobs.push(job)
            }
        })

        // Remove completed jobs
        this._pendingJobs = this._pendingJobs.filter(job => completedJobs.indexOf(job) === -1)

        if (this._pendingJobs.length === 0) {
            Log.verbose("[PeriodicJobManager] All jobs complete.")
        } else {
            Log.verbose("[PeriodicJobManager] " + this._pendingJobs.length + " jobs remaining.")
        }

        // Return true if all jobs were completed, false otherwise
        return this._pendingJobs.length === 0
    }
}
