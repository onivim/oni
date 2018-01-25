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

import { remote } from "electron"
import * as find from "lodash/find"
import * as flatten from "lodash/flatten"

import * as Oni from "oni-api"

import { Menu, MenuManager } from "./../Services/Menu"

export interface ITask {
    name: string
    detail: string
    command: string
    messageSuccess?: string
    messageFail?: string // TODO: implement callbacks to return boolean
    callback: () => void
}

export interface ITaskProvider {
    getTasks(): Promise<ITask[]>
}

export class Tasks {
    private _lastTasks: ITask[] = []
    private _menu: Menu
    private _providers: ITaskProvider[] = []

    constructor(private _menuManager: MenuManager) {}

    // TODO: This should be refactored, as it is simply
    // a timing dependency on when the object is created versus when
    // it is shown.
    public registerTaskProvider(taskProvider: ITaskProvider): void {
        this._providers.push(taskProvider)
    }

    public show(): void {
        this._refreshTasks().then(() => {
            const options: Oni.Menu.MenuOption[] = this._lastTasks
                .filter(t => t.name || t.detail)
                .map(f => {
                    return {
                        icon: "tasks",
                        label: f.name,
                        detail: f.detail,
                    }
                })

            this._menu = this._menuManager.create()
            this._menu.onItemSelected.subscribe((selection: any) => this._onItemSelected(selection))
            this._menu.show()
            this._menu.setItems(options)
        })
    }

    private async _onItemSelected(selectedOption: Oni.Menu.MenuOption): Promise<void> {
        const { label, detail } = selectedOption

        const selectedTask = find(this._lastTasks, t => t.name === label && t.detail === detail)

        if (selectedTask) {
            await selectedTask.callback()

            // TODO: we should make the callback return a bool so we can display either success/fail messages
            if (selectedTask.messageSuccess != null) {
                remote.dialog.showMessageBox({
                    type: "info",
                    title: "Success",
                    message: selectedTask.messageSuccess,
                })
            }
        }
    }

    private async _refreshTasks(): Promise<void> {
        this._lastTasks = []

        const initialProviders: ITaskProvider[] = []
        const taskProviders = initialProviders.concat(this._providers)
        const allTasks = await Promise.all(
            taskProviders.map(async (t: ITaskProvider) => (await t.getTasks()) || []),
        )
        this._lastTasks = flatten(allTasks)
    }
}

let _tasks: Tasks = null

export const activate = (menuManager: MenuManager) => {
    _tasks = new Tasks(menuManager)
}

export const getInstance = (): Tasks => {
    return _tasks
}
