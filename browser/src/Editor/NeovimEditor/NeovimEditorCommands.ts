/**
 * NeovimEditorCommands
 *
 * Contextual commands for NeovimEditor
 * 
 */

import { CallbackCommand, CommandManager } from "./../../Services/CommandManager"
import { LanguageEditorIntegration } from "./../../Services/Language"

import { Rename } from "./Rename"

export class NeovimEditorCommands {

    private _lastCommands: CallbackCommand[] = []

    constructor(
        private _commandManager: CommandManager,
        private _languageEditorIntegration: LanguageEditorIntegration,
        private _rename: Rename,
    ) { }

    public activate(): void {

        const isRenameActive = () => this._rename.isRenameActive()

        const commands = [
            new CallbackCommand("editor.rename", "Rename", "Rename an item", () => this._rename.startRename()),
            new CallbackCommand("editor.rename.commit", null, null, () => this._rename.commitRename(), isRenameActive),
            new CallbackCommand("editor.rename.cancel", null, null, () => this._rename.cancelRename(), isRenameActive),

            new CallbackCommand("editor.quickInfo.show", null, null, () => this._languageEditorIntegration.showHover()),
        ]

        this._lastCommands = commands
        commands.forEach((c) => this._commandManager.registerCommand(c))
    }

    public deactivate(): void {
        this._lastCommands.forEach((c) => this._commandManager.unregisterCommand(c.command))
        this._lastCommands = []
    }
}

