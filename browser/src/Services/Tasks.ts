/**
 * Tasks.ts
 *
 * Manages the 'tasks' pane
 *
 * Tasks encompass a few different pieces of functionality:
 *  - Launch parameters from a .oni folder
 *  - Plugin commands
 *  - NPM tasks
 */

import * as UI from "./../UI/index"
import * as _ from "lodash"

export interface ITask {
    name: string
    detail: string
    callback: () => void
}

export interface ITaskProvider {
    getTasks(): Promise<ITask[]>
}

export class DummyTaskProvider implements ITaskProvider {
    public getTasks(): Promise<ITask[]> {
        return Promise.resolve([{
            name: "NPM: build",
            detail: "derp",
            callback: () => { alert("selected!") }
        }])
    }
}

export class Tasks {

    private _taskProviders: ITaskProvider[] = []

    private _lastTasks: ITask[] = []

    constructor() {
        this._taskProviders.push(new DummyTaskProvider())

        UI.events.on("menu-item-selected:tasks", (selectedItem: any) => {

            const {label, detail} = selectedItem.selectedOption

            const selectedTask = _.find(this._lastTasks, t => t.name === label && t.detail === detail)

            if (selectedTask) {
                selectedTask.callback()
            }
        })
    }

    private _refreshTasks(): Promise<void> {
        this._lastTasks = []

        const promises = this._taskProviders.map(t => t.getTasks() || [])

        return Promise.all(promises)
            .then((vals: ITask[][]) => {
                this._lastTasks = _.flatten(vals)
            })
    }

    public show(): void {
        this._refreshTasks().then(() => {
            const options = this._lastTasks.map((f) => {
                return {
                    icon: "tasks",
                    label: f.name,
                    detail: f.detail
                }
            })

            UI.showPopupMenu("tasks", options)
        })
    }

}
