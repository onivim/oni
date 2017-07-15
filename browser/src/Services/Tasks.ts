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

import * as _ from "lodash"

import * as Parser from "./../Parser"
import { getProjectConfiguration } from "./../ProjectConfig"
import * as UI from "./../UI/index"

import { OutputWindow } from "./Output"

const findUp = require("find-up") // tslint:disable-line no-var-requires

export interface ITask {
    name: string
    detail: string
    callback: () => void
}

export interface ITaskProvider {
    getTasks(): Promise<ITask[]>
}

/**
 * Implementation of TasksProvider that gets launch tasks
 * from .oni/launch.json
 */
export class OniLaunchTasksProvider implements ITaskProvider {
    private _currentBufferPath: string
    private _output: OutputWindow

    constructor(currentBufferPath: string, output: OutputWindow) {
        this._currentBufferPath = currentBufferPath
        this._output = output
    }

    public getTasks(): Promise<ITask[]> {
        return getProjectConfiguration(this._currentBufferPath)
            .then((config) => {
                return config.launchConfigurations.map((p) => ({
                    name: p.name,
                    detail: p.program,
                    callback: () => {
                        const launchCommand = p.program + " " + p.args.join(" ")
                        const commands = p.dependentCommands.concat([launchCommand])
                        this._output.executeCommands(commands)
                    },
                }))
            })
    }
}

export class PackageJsonTasksProvider implements ITaskProvider {

    private _currentPath: string
    private _output: OutputWindow

    constructor(currentPath: string, output: OutputWindow) {
        this._currentPath = currentPath
        this._output = output
    }

    public async getTasks(): Promise<ITask[]> {

        const filePath = await findUp("package.json", { cwd: this._currentPath })

        if (!filePath) {
            return []
        }

        const packageJson = Parser.parseJsonFromFile<any>(filePath)

        if (!packageJson.scripts) {
            return[]
        }

        const scripts = packageJson.scripts
        const tasks = Object.keys(scripts)
            .map((key) => ({
                name: key,
                detail: scripts[key],
                callback: () => this._output.execute(`npm run ${key}`),
            }))

        return tasks
    }
}

export class Tasks {
    private _lastTasks: ITask[] = []
    private _currentBufferPath: string
    private _output: OutputWindow

    private _providers: ITaskProvider[] = []

    constructor(output: OutputWindow) {
        this._output = output

        UI.events.on("menu-item-selected:tasks", (selectedItem: any) => {
            const {label, detail} = selectedItem.selectedOption

            const selectedTask = _.find(this._lastTasks, (t) => t.name === label && t.detail === detail)

            if (selectedTask) {
                selectedTask.callback()
            }
        })
    }

    public registerTaskProvider(taskProvider: ITaskProvider): void {
        this._providers.push(taskProvider)
    }

    public onEvent(event: Oni.EventContext): void {
        this._currentBufferPath = event.bufferFullPath
    }

    public show(): void {
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

    private async _refreshTasks(): Promise<void> {
        this._lastTasks = []

        let initialProviders: ITaskProvider[] = []
        const taskProviders = initialProviders.concat(this._providers)
        const rootPath = this._currentBufferPath || process.cwd()
        taskProviders.push(new OniLaunchTasksProvider(rootPath, this._output))
        taskProviders.push(new PackageJsonTasksProvider(rootPath, this._output))

        const allTasks = await Promise.all(taskProviders.map(async (t: ITaskProvider) => await t.getTasks() || []))

        this._lastTasks = _.flatten(allTasks)
    }
}
