/**
 * NeovimEditorCommands
 *
 * Contextual commands for NeovimEditor
 *
 */

import * as Oni from "oni-api"

import { CallbackCommand, CommandManager } from "./../../Services/CommandManager"
import { ContextMenuManager } from "./../../Services/ContextMenu"
import { LanguageEditorIntegration } from "./../../Services/Language"

import { Definition } from "./Definition"
import { Rename } from "./Rename"
import { Symbols } from "./Symbols"

export class NeovimEditorCommands {

    private _lastCommands: CallbackCommand[] = []

    constructor(
        private _commandManager: CommandManager,
        private _contextMenuManager: ContextMenuManager,
        private _definition: Definition,
        private _languageEditorIntegration: LanguageEditorIntegration,
        private _rename: Rename,
        private _symbols: Symbols,
    ) { }

    public activate(): void {
        const isContextMenuOpen = () => this._contextMenuManager.isMenuOpen()

        /**
         * Higher-order function for commands dealing with completion
         * - checks that the completion menu is open
         */
        const contextMenuCommand = (innerCommand: Oni.Commands.CommandCallback) => {
            return () => {
                if (this._contextMenuManager.isMenuOpen()) {
                    return innerCommand()
                }

                return false
            }
        }

        const selectContextMenuItem = contextMenuCommand(() => {
            this._contextMenuManager.selectMenuItem()
        })

        const nextContextMenuItem = contextMenuCommand(() => {
            this._contextMenuManager.nextMenuItem()
        })

        const closeContextMenu = contextMenuCommand(() => {
            this._contextMenuManager.closeActiveMenu()
        })

        const previousContextMenuItem = contextMenuCommand(() => {
            this._contextMenuManager.previousMenuItem()
        })

        const isRenameActive = () => this._rename.isRenameActive()
        const commands = [
            new CallbackCommand("contextMenu.select", null, null, selectContextMenuItem, isContextMenuOpen),
            new CallbackCommand("contextMenu.next", null, null, nextContextMenuItem, isContextMenuOpen),
            new CallbackCommand("contextMenu.previous", null, null, previousContextMenuItem, isContextMenuOpen),
            new CallbackCommand("contextMenu.close", null, null, closeContextMenu, isContextMenuOpen),

            // TODO: Deprecate
            new CallbackCommand("oni.editor.gotoDefinition", null, null, () => this._definition.gotoDefinitionUnderCursor()),
            new CallbackCommand("language.gotoDefinition", "Goto Definition", "Goto definition using a language service", () => this._definition.gotoDefinitionUnderCursor()),
            new CallbackCommand("language.gotoDefinition.openVertical", null, null, () => this._definition.gotoDefinitionUnderCursor(1)),
            new CallbackCommand("language.gotoDefinition.openHorizontal", null, null, () => this._definition.gotoDefinitionUnderCursor(2)),

            new CallbackCommand("editor.rename", "Rename", "Rename an item", () => this._rename.startRename()),
            new CallbackCommand("editor.rename.commit", null, null, () => this._rename.commitRename(), isRenameActive),
            new CallbackCommand("editor.rename.cancel", null, null, () => this._rename.cancelRename(), isRenameActive),

            new CallbackCommand("editor.quickInfo.show", null, null, () => this._languageEditorIntegration.showHover()),

            new CallbackCommand("language.symbols.document", null, null, () => this._symbols.openDocumentSymbolsMenu()),
            new CallbackCommand("language.symbols.workspace", null, null, () => this._symbols.openWorkspaceSymbolsMenu()),

        ]

        this._lastCommands = commands
        commands.forEach((c) => this._commandManager.registerCommand(c))
    }

    public deactivate(): void {
        this._lastCommands.forEach((c) => this._commandManager.unregisterCommand(c.command))
        this._lastCommands = []
    }
}
