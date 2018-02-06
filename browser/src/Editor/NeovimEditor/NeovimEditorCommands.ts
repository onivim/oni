/**
 * NeovimEditorCommands
 *
 * Contextual commands for NeovimEditor
 *
 */
import * as fs from "fs"
import * as os from "os"
import * as path from "path"

import { clipboard } from "electron"
import * as Oni from "oni-api"

import { NeovimInstance } from "./../../neovim"
import { CallbackCommand, CommandManager } from "./../../Services/CommandManager"
import { getUserConfigFilePath } from "./../../Services/Configuration"
import { ContextMenuManager } from "./../../Services/ContextMenu"
import { editorManager } from "./../../Services/EditorManager"
import { findAllReferences, format, LanguageEditorIntegration } from "./../../Services/Language"
import { MenuManager } from "./../../Services/Menu"
import { QuickOpen } from "./../../Services/QuickOpen"
import { replaceAll } from "./../../Utility"

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
        private _menuManager: MenuManager,
        private _neovimInstance: NeovimInstance,
        private _rename: Rename,
        private _symbols: Symbols,
    ) {}

    public activate(): void {
        const isContextMenuOpen = () => this._contextMenuManager.isMenuOpen()

        // TODO: This should be extracted
        // - Should not depend on NeovimInstance
        // - Should be able to work against the public 'IEditor' interface
        const quickOpen = new QuickOpen(this._menuManager, this._neovimInstance)

        const quickOpenCommand = (innerCommand: Oni.Commands.CommandCallback) => (
            qo: QuickOpen,
        ) => {
            return () => {
                if (qo.isOpen()) {
                    return innerCommand(qo)
                }

                return false
            }
        }

        const quickOpenFileNewTab = quickOpenCommand((qo: QuickOpen) => qo.openFileNewTab())
        const quickOpenFileHorizontal = quickOpenCommand((qo: QuickOpen) => qo.openFileHorizontal())
        const quickOpenFileVertical = quickOpenCommand((qo: QuickOpen) => qo.openFileVertical())

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
            const textToPaste = clipboard.readText()
            const sanitizedText = replaceAll(textToPaste, { "<": "<lt>" })
                .split(os.EOL)
                .join("<cr>")

            await neovimInstance.command("set paste")
            await neovimInstance.input(sanitizedText)
            await neovimInstance.command("set nopaste")
        }

        const openDefaultConfig = async (): Promise<void> => {
            const activeEditor = editorManager.activeEditor
            const buf = await activeEditor.openFile(getUserConfigFilePath())
            const lineCount = buf.lineCount

            if (lineCount === 1) {
                const defaultConfigJsPath = path.join(
                    __dirname,
                    "configuration",
                    "config.default.js",
                )
                const defaultConfigLines = fs
                    .readFileSync(defaultConfigJsPath, "utf8")
                    .split(os.EOL)
                await buf.setLines(0, defaultConfigLines.length, defaultConfigLines)
            }
        }

        const shouldShowMenu = () => {
            return !this._menuManager.isMenuOpen()
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
                () => this._neovimInstance.input("y"),
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
                this._definition.gotoDefinitionUnderCursor(1),
            ),
            new CallbackCommand("language.gotoDefinition.openHorizontal", null, null, () =>
                this._definition.gotoDefinitionUnderCursor(2),
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
                "oni.config.openConfigJs",
                "Configuration: Edit Oni Config",
                "Edit configuration file ('config.js') for Oni",
                () => openDefaultConfig(),
            ),

            new CallbackCommand(
                "oni.config.openInitVim",
                "Configuration: Edit Neovim Config",
                "Edit configuration file ('init.vim') for Neovim",
                () => this._neovimInstance.openInitVim(),
            ),

            // TODO: Factor these out
            new CallbackCommand(
                "quickOpen.show",
                null,
                null,
                () => quickOpen.show(),
                shouldShowMenu,
            ),
            new CallbackCommand("quickOpen.showBufferLines", null, null, () =>
                quickOpen.showBufferLines(),
            ),
            new CallbackCommand(
                "quickOpen.openFileNewTab",
                null,
                null,
                quickOpenFileNewTab(quickOpen),
            ),
            new CallbackCommand(
                "quickOpen.openFileVertical",
                null,
                null,
                quickOpenFileVertical(quickOpen),
            ),
            new CallbackCommand(
                "quickOpen.openFileHorizontal",
                null,
                null,
                quickOpenFileHorizontal(quickOpen),
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
