/**
 * OniEditor.tsx
 *
 * Extension of NeovimEditor with Oni enhancements
 */

import * as React from "react"

import "rxjs/add/observable/defer"
import "rxjs/add/observable/merge"
import "rxjs/add/operator/map"
import "rxjs/add/operator/mergeMap"
import { Observable } from "rxjs/Observable"

import { Provider } from "react-redux"
import { bindActionCreators, Store } from "redux"

import { clipboard, ipcRenderer, remote } from "electron"

import * as Oni from "oni-api"
import { Event } from "oni-types"

import * as Log from "./../../Log"

import { addDefaultUnitIfNeeded } from "./../../Font"
import { BufferEventContext, EventContext, INeovimStartOptions, NeovimInstance, NeovimScreen, NeovimWindowManager } from "./../../neovim"
import { CanvasRenderer, INeovimRenderer } from "./../../Renderer"

import { IColors } from "./../../Services/Colors"
import { commandManager } from "./../../Services/CommandManager"
import { registerBuiltInCommands } from "./../../Services/Commands"
import { Completion } from "./../../Services/Completion"
import { Configuration, IConfigurationValues } from "./../../Services/Configuration"
import { IDiagnosticsDataSource } from "./../../Services/Diagnostics"
import { Errors } from "./../../Services/Errors"
import * as Shell from "./../../UI/Shell"

import {
    addInsertModeLanguageFunctionality,
    LanguageEditorIntegration,
    LanguageManager,
} from "./../../Services/Language"

import {
    ISyntaxHighlighter,
    NullSyntaxHighlighter,
    SyntaxHighlighter,
} from "./../../Services/SyntaxHighlighting"

import { tasks } from "./../../Services/Tasks"
import { ThemeManager } from "./../../Services/Themes"
import { TypingPredictionManager } from "./../../Services/TypingPredictionManager"
import { workspace } from "./../../Services/Workspace"

import { Editor, IEditor } from "./../Editor"

import { BufferManager } from "./../BufferManager"
import { CompletionMenu } from "./CompletionMenu"
import { HoverRenderer } from "./HoverRenderer"

import { ContextMenuManager } from "./../../Services/ContextMenu"
import { PluginManager } from "./../../Plugins/PluginManager"

import { normalizePath, sleep } from "./../../Utility"

import * as VimConfigurationSynchronizer from "./../../Services/VimConfigurationSynchronizer"

import { Definition } from "./Definition"
import { NeovimEditor } from "./../NeovimEditor"
import * as ActionCreators from "./../NeovimEditor/NeovimEditorActions"
import { OniEditorCommands } from "./OniEditorCommands"
import { createStore, IState } from "./../NeovimEditor/NeovimEditorStore"
import { Rename } from "./Rename"
import { Symbols } from "./Symbols"
import { IToolTipsProvider, NeovimEditorToolTipsProvider } from "./ToolTipsProvider"

export class OniEditor extends NeovimEditor {
    private _languageIntegration: LanguageEditorIntegration
    private _completion: Completion
    private _hoverRenderer: HoverRenderer
    private _rename: Rename = null
    private _symbols: Symbols = null
    private _definition: Definition = null
    private _commands: NeovimEditorCommands
    private _completionMenu: CompletionMenu
    private _contextMenuManager: ContextMenuManager
    private _toolTipsProvider: IToolTipsProvider
    private _modeChanged$: Observable<Oni.Vim.Mode>

    constructor(
        colors: IColors,
        configuration: Configuration,
        diagnostics: IDiagnosticsDataSource,
        pluginManager: PluginManager,
        themeManager: ThemeManager,
        private _languageManager: LanguageManager,
    ) {
        super(colors, configuration, diagnostics, pluginManager, themeManager)

        this._contextMenuManager = new ContextMenuManager(this._toolTipsProvider, this.colors)
        this._hoverRenderer = new HoverRenderer(this.colors, this, this.configuration, this._toolTipsProvider)

        this._definition = new Definition(this, this.store)
        this._symbols = new Symbols(this, this._definition, this._languageManager)
        this._rename = new Rename(this, this._languageManager, this._toolTipsProvider)

        this._modeChanged$ = this.neovimInstance.onModeChanged.asObservable()
        addInsertModeLanguageFunctionality(this._cursorMovedI$, this._modeChanged$, this._toolTipsProvider)

        this._completion = new Completion(this, this._languageManager, this.configuration)
        this._completionMenu = new CompletionMenu(this._contextMenuManager.create())

        this._completion.onShowCompletionItems.subscribe((completions) => {
            this._completionMenu.show(completions.filteredCompletions, completions.base)
        })

        this._completion.onHideCompletionItems.subscribe((completions) => {
            this._completionMenu.hide()
        })

        this._completionMenu.onItemFocused.subscribe((item) => {
            this._completion.resolveItem(item)
        })

        this._completionMenu.onItemSelected.subscribe((item) => {
            this._completion.commitItem(item)
        })

        this._languageIntegration = new LanguageEditorIntegration(this, this.configuration, this._languageManager)

        this._languageIntegration.onShowHover.subscribe((hover) => {
            const { cursorPixelX, cursorPixelY } = this.store.getState()
            this._hoverRenderer.showQuickInfo(cursorPixelX, cursorPixelY, hover.hover, hover.errors)
        })

        this._languageIntegration.onHideHover.subscribe(() => {
            this._hoverRenderer.hideQuickInfo()
        })

        this._languageIntegration.onShowDefinition.subscribe((definition) => {
            this.actions.setDefinition(definition.token, definition.location)
        })

        this._languageIntegration.onHideDefinition.subscribe((definition) => {
            this.actions.hideDefinition()
        })

        this._toolTipsProvider = new NeovimEditorToolTipsProvider(this.actions)

        this._commands = new NeovimEditorCommands(
            commandManager,
            this._contextMenuManager,
            this._definition,
            this._languageIntegration,
            this._rename,
            this._symbols,
        )
    }

    public enter(): void {
        super.enter()
        this._commands.activate()
    }

    public leave(): void {
        super.leave()
        this._commands.deactivate()
    }

    public dispose(): void {
        super.dispose()

        if (this._languageIntegration) {
            this._languageIntegration.dispose()
            this._languageIntegration = null
        }

        if (this._completion) {
            this._completion.dispose()
            this._completion = null
        }
    }
}
