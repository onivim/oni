/**
 * NeovimEditorCommands
 *
 * Contextual commands for NeovimEditor
 *
 */
import * as Oni from "oni-api"

import { NeovimInstance } from "./../../neovim"
import { CallbackCommand, CommandManager } from "./../../Services/CommandManager"
import { ContextMenuManager } from "./../../Services/ContextMenu"
import { findAllReferences, format, LanguageEditorIntegration } from "./../../Services/Language"

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
        private _neovimInstance: NeovimInstance,
        private _rename: Rename,
        private _symbols: Symbols,
    ) {}

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

        const pasteContents = async (neovimInstance: NeovimInstance) => {
            await neovimInstance.command('normal! "+p')
        }

        const commands = [
            new CallbackCommand(
                "contextMenu.select",
                null,
                null,
                selectContextMenuItem,
                isContextMenuOpen,
            ),
            new CallbackCommand(
                "contextMenu.next",
                null,
                null,
                nextContextMenuItem,
                isContextMenuOpen,
            ),
            new CallbackCommand(
                "contextMenu.previous",
                null,
                null,
                previousContextMenuItem,
                isContextMenuOpen,
            ),
            new CallbackCommand(
                "contextMenu.close",
                null,
                null,
                closeContextMenu,
                isContextMenuOpen,
            ),

            new CallbackCommand(
                "editor.clipboard.paste",
                "Clipboard: Paste",
                "Paste clipboard contents into active text",
                () => pasteContents(this._neovimInstance),
            ),
            new CallbackCommand(
                "editor.clipboard.yank",
                "Clipboard: Yank",
                "Yank contents to clipboard",
                () => this._neovimInstance.command('normal! "+y'),
            ),
            new CallbackCommand(
                "editor.clipboard.cut",
                "Clipboard: Cut",
                "Cut contents to clipboard",
                () => this._neovimInstance.command('normal! "+x'),
            ),
            new CallbackCommand("oni.editor.findAllReferences", null, null, () =>
                findAllReferences(),
            ),
            new CallbackCommand(
                "language.findAllReferences",
                "Find All References",
                "Find all references using a language service",
                () => findAllReferences(),
            ),

            new CallbackCommand("language.format", null, null, () => format()),

            // TODO: Deprecate
            new CallbackCommand("oni.editor.gotoDefinition", null, null, () =>
                this._definition.gotoDefinitionUnderCursor(),
            ),
            new CallbackCommand(
                "language.gotoDefinition",
                "Goto Definition",
                "Goto definition using a language service",
                () => this._definition.gotoDefinitionUnderCursor(),
            ),
            new CallbackCommand("language.gotoDefinition.openVertical", null, null, () =>
                this._definition.gotoDefinitionUnderCursor({
                    openMode: Oni.FileOpenMode.VerticalSplit,
                }),
            ),
            new CallbackCommand("language.gotoDefinition.openHorizontal", null, null, () =>
                this._definition.gotoDefinitionUnderCursor({
                    openMode: Oni.FileOpenMode.HorizontalSplit,
                }),
            ),
            new CallbackCommand("language.gotoDefinition.openNewTab", null, null, () =>
                this._definition.gotoDefinitionUnderCursor({ openMode: Oni.FileOpenMode.NewTab }),
            ),
            new CallbackCommand("language.gotoDefinition.openEdit", null, null, () =>
                this._definition.gotoDefinitionUnderCursor({ openMode: Oni.FileOpenMode.Edit }),
            ),
            new CallbackCommand("language.gotoDefinition.openExistingTab", null, null, () =>
                this._definition.gotoDefinitionUnderCursor({
                    openMode: Oni.FileOpenMode.ExistingTab,
                }),
            ),

            new CallbackCommand("editor.rename", "Rename", "Rename an item", () =>
                this._rename.startRename(),
            ),

            new CallbackCommand("editor.quickInfo.show", null, null, () =>
                this._languageEditorIntegration.showHover(),
            ),

            new CallbackCommand("language.symbols.document", null, null, () =>
                this._symbols.openDocumentSymbolsMenu(),
            ),
            new CallbackCommand("language.symbols.workspace", null, null, () =>
                this._symbols.openWorkspaceSymbolsMenu(),
            ),
            new CallbackCommand(
                "oni.config.openInitVim",
                "Configuration: Edit Neovim Config",
                "Edit configuration file ('init.vim') for Neovim",
                () => this._neovimInstance.openInitVim(),
            ),
        ]

        this._lastCommands = commands
        commands.forEach(c => this._commandManager.registerCommand(c))
    }

    public deactivate(): void {
        this._lastCommands.forEach(c => this._commandManager.unregisterCommand(c.command))
        this._lastCommands = []
    }
}
