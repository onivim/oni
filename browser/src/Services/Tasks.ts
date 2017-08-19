/**
 * Tasks.ts
 *
 * Manages the 'tasks' pane / Command Palette
 *
 * Tasks encompass a few different pieces of functionality:
 *  - Launch parameters from a .oni folder
 *  - Plugin commands
 *  - NPM tasks
 */

import * as find from "lodash/find"
import * as flatten from "lodash/flatten"

import * as UI from "./../UI/index"

export interface ITask {
    name: string
    detail: string
    callback: () => void
}

export interface ITaskProvider {
    getTasks(): Promise<ITask[]>
}

export class Tasks {
    private _lastTasks: ITask[] = []
    private _currentBufferPath: string

    private _providers: ITaskProvider[] = []

    // TODO: This should be refactored, as it is simply
    // a timing dependency on when the object is created versus when 
    // it is shown.
    private _initialized = false

    public registerTaskProvider(taskProvider: ITaskProvider): void {
        this._providers.push(taskProvider)
    }

    public onEvent(event: Oni.EventContext): void {
        this._currentBufferPath = event.bufferFullPath
    }

    public show(): void {
        this._init()

        this._refreshTasks().then(() => {
            const options = this._lastTasks.map((f) => {
                return {
                    icon: "tasks",
                    label: f.name,
                    detail: f.detail,
                }
            })

            UI.Actions.showPopupMenu("tasks", options)
        })
    }

    private _init(): void {
        if (!this._initialized) {
            UI.events.on("menu-item-selected:tasks", (selectedItem: any) => {
                const {label, detail} = selectedItem.selectedOption

                const selectedTask = find(this._lastTasks, (t) => t.name === label && t.detail === detail)

                if (selectedTask) {
                    selectedTask.callback()
                }
            })
            this._initialized = true
        }
    }

    private async _refreshTasks(): Promise<void> {
        this._lastTasks = []

        let initialProviders: ITaskProvider[] = []
        const taskProviders = initialProviders.concat(this._providers)
        const allTasks = await Promise.all(taskProviders.map(async (t: ITaskProvider) => await t.getTasks() || []))
        this._lastTasks = flatten(allTasks)
    }
}

export const tasks = new Tasks()
