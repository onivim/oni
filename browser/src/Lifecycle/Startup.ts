/**
 * Startup.ts
 *
 * Entry point for the app
 */

export type Task = () => Promise<void>

import * as Log from "./../Log"

export class Startup {

    private _tasks: Task[] = []

    public enqueueTask(name: string, task: Task): void {

        this._tasks.push(async () => {
            Log.verbose(`[Startup] BEGIN ${name}`)
            const startTime = new Date().getTime()

            await task()
            const endTime = new Date().getTime()

            const totalTime = endTime - startTime

            Log.verbose(`[Startup] END ${name}: ${totalTime}ms`)
        })

    }

    public start(): Promise<any> {
        const promises = this._tasks.map((t) => t())
        return Promise.all(promises)
    }
}
