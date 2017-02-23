/**
 * Commands.ts
 *
 * Implementation of command registration / callback for plugins
 */

interface ICommandCallback {
    (args?: any): void
}

/**
 * API instance for interacting with Oni (and vim)
 */
export class Commands {

    private _commandToCallback: { [command: string]: ICommandCallback } = { }

    public registerCommand(commandName: string, callback: ICommandCallback): void {
        this._commandToCallback[commandName] = callback
    }

    public onCommand(commandName: string, args?: any) {
         const command = this._commandToCallback[commandName]

         if (!command) {
            console.warn(`No command registered: ${commandName}`)
            return
         }

         command(args)
    }
}
