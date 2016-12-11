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
import { getProjectConfiguration } from "./../ProjectConfig"

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

// TODO:
//  - Need to get current buffer (maybe listen for events)?
//  - When tasks are opened, create instances of those objects and pass in the path to the constructor

/**
 * Implementation of TasksProvider that gets launch tasks
 * from .oni/launch.json
 */
export class OniLaunchTasksProvider implements ITaskProvider {
    private _currentBufferPath: string

    constructor(currentBufferPath: string) {
        this._currentBufferPath = currentBufferPath
    }

    public getTasks(): Promise<ITask[]> {
        return getProjectConfiguration(this._currentBufferPath)
                .then((config) => {
                    return config.launchConfigurations.map(p => ({
                        name: p.name,
                        detail: p.program,
                        callback: () => alert(p.name + ":" + p.program)
                    }))
                })
    }
}

export class Tasks {
    private _lastTasks: ITask[] = []
    private _currentBufferPath: string

    constructor() {
        UI.events.on("menu-item-selected:tasks", (selectedItem: any) => {
            const {label, detail} = selectedItem.selectedOption

            const selectedTask = _.find(this._lastTasks, t => t.name === label && t.detail === detail)

            if (selectedTask) {
                selectedTask.callback()
            }
        })
    }

    public onEvent(event: Oni.EventContext): void {
        this._currentBufferPath = event.bufferFullPath
    }

    private _refreshTasks(): Promise<void> {
        this._lastTasks = []

        const taskProviders = []
        taskProviders.push(new DummyTaskProvider())
        taskProviders.push(new OniLaunchTasksProvider(this._currentBufferPath))

        const promises = taskProviders.map(t => t.getTasks() || [])

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
