import * as Sender from "./Sender"

/**
 * API instance for interacting with Oni (and vim)
 */
export class Editor implements Oni.Editor { 

    public executeShellCommand(shellCommand: string) {
        Sender.send("execute-shell-command", null, {
            command: shellCommand
        })
    }
}

