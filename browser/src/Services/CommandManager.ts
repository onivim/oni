/**
 * CommandManager.ts
 *
 * Manages Oni commands. These commands show up in the command palette, and are exposed to plugins.
 */

import * as values from "lodash/values"

import * as Oni from "oni-api"
import * as Log from "oni-core-logging"

import { INeovimInstance } from "./../neovim"
import { ITask, ITaskProvider } from "./Tasks"

export class CallbackCommand implements Oni.Commands.ICommand {
    public messageSuccess?: string
    public messageFail?: string

    constructor(
        public command: string,
        public name: string,
        public detail: string,
        public execute: Oni.Commands.CommandCallback,
        public enabled?: Oni.Commands.CommandEnabledCallback,
    ) {}
}

export class VimCommand implements Oni.Commands.ICommand {
    constructor(
        public command: string,
        public name: string,
        public detail: string,
        private _vimCommand: string,
        private _neovimInstance: INeovimInstance,
    ) {}

    public execute(): void {
        this._neovimInstance.command(this._vimCommand)
    }
}

export class CommandManager implements ITaskProvider {
    private _commandDictionary: { [key: string]: Oni.Commands.ICommand } = {}

    public clearCommands(): void {
        this._commandDictionary = {}
    }

    //NOTE: Arrow function here preserves the "this" binding of this method
    public registerCommand = (command: Oni.Commands.ICommand): void => {
        if (this._commandDictionary[command.command]) {
            Log.verbose(`Overwriting existing command: ${command.command}`)
        }

        this._commandDictionary[command.command] = command
    }

    public hasCommand(commandName: string): boolean {
        return !!this._commandDictionary[commandName]
    }

    public unregisterCommand(commandName: string): void {
        delete this._commandDictionary[commandName]
    }

    public executeCommand(name: string, args?: any): boolean | void {
        const command = this._commandDictionary[name]

        if (!command) {
            return false
        }

        let enabled = true
        if (typeof command.enabled === "function") {
            enabled = command.enabled()
        }

        if (!enabled) {
            return false
        }

        if (!command) {
            Log.error(`Unable to find command: ${name}`)
            return false
        }

        return command.execute(args)
    }

    public getTasks(): Promise<ITask[]> {
        const commands = values(this._commandDictionary).filter(
            (c: Oni.Commands.ICommand) => !c.enabled || c.enabled(),
        )

        const tasks = commands.map(c => ({
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
