/**
 * CommandManager.ts
 *
 * Manages Oni commands. These commands show up in the command palette, and are exposed to plugins.
 */

import * as values from "lodash/values"

import * as Log from "./../Log"
import { INeovimInstance } from "./../neovim"
import { ITask, ITaskProvider } from "./Tasks"

export type ICommandCallback = (args?: any) => any
export type ICommandEnabledCallback = () => boolean

export interface ICommand {
    command: string
    name: string
    detail: string
    enabled?: ICommandEnabledCallback
    messageSuccess?: string
    messageFail?: string
    execute: ICommandCallback
}

export class CallbackCommand implements ICommand {
    public messageSuccess?: string
    public messageFail?: string

    constructor(
        public command: string,
        public name: string,
        public detail: string,
        public execute: ICommandCallback,
        public enabled?: ICommandEnabledCallback) {
    }
}

export class VimCommand implements ICommand {
    constructor(
        public command: string,
        public name: string, public detail: string,
        private _vimCommand: string,
        private _neovimInstance: INeovimInstance) {

    }

    public execute(): void {
        this._neovimInstance.command(this._vimCommand)
    }
}

export class CommandManager implements ITaskProvider {

    private _commandDictionary: { [key: string]: ICommand } = {}

    public clearCommands(): void {
        this._commandDictionary = {}
    }

    public registerCommand(command: ICommand): void {
        if (this._commandDictionary[command.command]) {
            Log.error(`Tried to register multiple commands for: ${command.name}`)
            return
        }

        this._commandDictionary[command.command] = command
    }

    public executeCommand(name: string, args?: any): boolean | void {
        const command = this._commandDictionary[name]

        if (!command) {
            Log.error(`Unable to find command: ${name}`)
            return false
        }

        return command.execute(args)
    }

    public getTasks(): Promise<ITask[]> {
        const commands =
            values(this._commandDictionary)
                .filter((c: ICommand) => !c.enabled || (c.enabled()))

        const tasks = commands.map((c) => ({
            name: c.name,
            detail: c.detail,
            command: c.command,
            messageSuccess: c.messageSuccess,
            messageFail: c.messageFail,
            callback: () => c.execute(),
        }))

        return Promise.resolve(tasks)
    }
}

export const commandManager = new CommandManager()
