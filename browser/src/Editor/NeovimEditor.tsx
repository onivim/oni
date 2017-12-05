/**
 * NeovimEditor.ts
 *
 * IEditor implementation for Neovim
 */

import * as React from "react"

import "rxjs/add/observable/defer"
import "rxjs/add/observable/merge"
import "rxjs/add/operator/map"
import "rxjs/add/operator/mergeMap"
import { Observable } from "rxjs/Observable"

import { clipboard, ipcRenderer, remote } from "electron"

import * as Oni from "oni-api"

import * as Log from "./../Log"

import { EventContext, INeovimStartOptions, NeovimInstance, NeovimWindowManager } from "./../neovim"
import { CanvasRenderer, INeovimRenderer } from "./../Renderer"
import { NeovimScreen } from "./../Screen"

import { pluginManager } from "./../Plugins/PluginManager"

import { Colors } from "./../Services/Colors"
import { CallbackCommand, commandManager } from "./../Services/CommandManager"
import { registerBuiltInCommands } from "./../Services/Commands"
import { Completion } from "./../Services/Completion"
import { configuration, IConfigurationValues } from "./../Services/Configuration"
import { Errors } from "./../Services/Errors"
import { addInsertModeLanguageFunctionality, LanguageEditorIntegration, languageManager } from "./../Services/Language"
import { ISyntaxHighlighter, NullSyntaxHighlighter, SyntaxHighlighter } from "./../Services/SyntaxHighlighting"
import { getThemeManagerInstance } from "./../Services/Themes"
import { TypingPredictionManager } from "./../Services/TypingPredictionManager"
import { workspace } from "./../Services/Workspace"

import * as UI from "./../UI/index"

import { Editor, IEditor } from "./Editor"

import { BufferManager } from "./BufferManager"
import { listenForBufferUpdates } from "./BufferUpdates"
import { CompletionMenu } from "./CompletionMenu"
import { HoverRenderer } from "./HoverRenderer"
import { NeovimPopupMenu } from "./NeovimPopupMenu"
import { NeovimSurface } from "./NeovimSurface"

import { tasks } from "./../Services/Tasks"

import { normalizePath, sleep } from "./../Utility"

import * as VimConfigurationSynchronizer from "./../Services/VimConfigurationSynchronizer"

export class NeovimEditor extends Editor implements IEditor {
    private _bufferManager: BufferManager
    private _neovimInstance: NeovimInstance
    private _renderer: INeovimRenderer
    private _screen: NeovimScreen
    private _completionMenu: CompletionMenu
    private _popupMenu: NeovimPopupMenu
    private _colors: Colors // TODO: Factor this out to the UI 'Shell'

    private _pendingAnimationFrame: boolean = false

    private _modeChanged$: Observable<Oni.Vim.Mode>
    private _cursorMoved$: Observable<Oni.Cursor>
    private _cursorMovedI$: Observable<Oni.Cursor>

    private _hasLoaded: boolean = false

    private _windowManager: NeovimWindowManager

    private _currentColorScheme: string = ""
    private _isFirstRender: boolean = true

    private _lastBufferId: string = null

    private _typingPredictionManager: TypingPredictionManager = new TypingPredictionManager()
    private _syntaxHighlighter: ISyntaxHighlighter
    private _languageIntegration: LanguageEditorIntegration
    private _completion: Completion
    private _hoverRenderer: HoverRenderer

    public /* override */ get activeBuffer(): Oni.Buffer {
        return this._bufferManager.getBufferById(this._lastBufferId)
    }

    // Capabilities
    public get neovim(): Oni.NeovimEditorCapability {
        return this._neovimInstance
    }

    public get syntaxHighlighter(): ISyntaxHighlighter {
        return this._syntaxHighlighter
    }

    constructor(
        private _config = configuration,
        private _themeManager = getThemeManagerInstance(),
    ) {
        super()

        const services: any[] = []

        this._neovimInstance = new NeovimInstance(100, 100)
        this._bufferManager = new BufferManager(this._neovimInstance)
        this._screen = new NeovimScreen()

        this._colors = new Colors(this._themeManager, this._config)

        this._hoverRenderer = new HoverRenderer(this, this._config)

        this._popupMenu = new NeovimPopupMenu(
            this._neovimInstance.onShowPopupMenu,
            this._neovimInstance.onHidePopupMenu,
            this._neovimInstance.onSelectPopupMenu,
            this.onBufferEnter,
        )

        this._renderer = new CanvasRenderer()

        // Services
        const errorService = new Errors(this._neovimInstance)

        registerBuiltInCommands(commandManager, this._neovimInstance)

        commandManager.registerCommand(new CallbackCommand(
            "editor.quickInfo.show",
            null,
            null,
            () => this._languageIntegration.showHover(),
        ))

        tasks.registerTaskProvider(commandManager)
        tasks.registerTaskProvider(errorService)

        services.push(errorService)

        this._colors.onColorsChanged.subscribe(() => {
            const updatedColors: any = this._colors.getColors()
            UI.Actions.setColors(updatedColors)
        })

        // Overlays
        // TODO: Replace `OverlayManagement` concept and associated window management code with
        // explicit window management: #362
        this._windowManager = new NeovimWindowManager(this._neovimInstance)

        this._neovimInstance.onYank.subscribe((yankInfo) => {
            if (configuration.getValue("editor.clipboard.enabled")) {
                clipboard.writeText(yankInfo.regcontents.join(require("os").EOL))
            }
        })

        this._neovimInstance.onTitleChanged.subscribe((newTitle) => {
            const title = newTitle.replace(" - NVIM", " - ONI")
            UI.Actions.setWindowTitle(title)
        })

        this._neovimInstance.onLeave.subscribe(() => {
            // TODO: Only leave if all editors are closed...
            if (!configuration.getValue("debug.persistOnNeovimExit")) {
                remote.getCurrentWindow().close()
            }
        })

        this._neovimInstance.onOniCommand.subscribe((command) => {
            commandManager.executeCommand(command)
        })

        this._neovimInstance.on("event", (eventName: string, evt: any) => this._onVimEvent(eventName, evt))

        this._neovimInstance.onColorsChanged.subscribe(() => {
            this._onColorsChanged()
        })

        this._neovimInstance.onError.subscribe((err) => {
            UI.Actions.setNeovimError(true)
        })

        this._neovimInstance.onDirectoryChanged.subscribe((newDirectory) => {
            workspace.changeDirectory(newDirectory)
        })

        this._neovimInstance.on("action", (action: any) => {
            this._renderer.onAction(action)
            this._screen.dispatch(action)

            this._scheduleRender()
        })

        this._neovimInstance.onRedrawComplete.subscribe(() => {
            UI.Actions.setCursorPosition(this._screen)
            this._typingPredictionManager.setCursorPosition(this._screen.cursorRow, this._screen.cursorColumn)
        })

        this._neovimInstance.on("tabline-update", (currentTabId: number, tabs: any[]) => {
            UI.Actions.setTabs(currentTabId, tabs)
        })

        this._cursorMoved$ = this._neovimInstance.autoCommands.onCursorMoved.asObservable()
            .map((evt): Oni.Cursor => ({
                line: evt.line - 1,
                column: evt.column - 1,
            }))

        this._cursorMovedI$ = this._neovimInstance.autoCommands.onCursorMovedI.asObservable()
            .map((evt): Oni.Cursor => ({
                line: evt.line - 1,
                column: evt.column - 1,
            }))

        Observable.merge(this._cursorMoved$, this._cursorMovedI$)
            .subscribe((cursorMoved) => {
                this.notifyCursorMoved(cursorMoved)
            })

        this._modeChanged$ = this._neovimInstance.onModeChanged.asObservable()
        this._neovimInstance.onModeChanged.subscribe((newMode) => this._onModeChanged(newMode))

        const bufferUpdates$ = listenForBufferUpdates(this._neovimInstance, this._bufferManager)
        bufferUpdates$.subscribe((bufferUpdate) => {
            this.notifyBufferChanged(bufferUpdate)
            UI.Actions.bufferUpdate(parseInt(bufferUpdate.buffer.id, 10), bufferUpdate.buffer.modified, bufferUpdate.buffer.lineCount)

            this._syntaxHighlighter.notifyBufferUpdate(bufferUpdate)
        })

        this._neovimInstance.onScroll.subscribe((args: EventContext) => {
            const convertedArgs: Oni.EditorBufferScrolledEventArgs = {
                bufferTotalLines: args.bufferTotalLines,
                windowTopLine: args.windowTopLine,
                windowBottomLine: args.windowBottomLine,
            }
            this.notifyBufferScrolled(convertedArgs)
        })

        addInsertModeLanguageFunctionality(this._cursorMovedI$, this._modeChanged$)

        const textMateHighlightingEnabled = this._config.getValue("experimental.editor.textMateHighlighting.enabled")
        this._syntaxHighlighter = textMateHighlightingEnabled ? new SyntaxHighlighter() : new NullSyntaxHighlighter()

        this._completion = new Completion(this, languageManager, configuration)
        this._completionMenu = new CompletionMenu()

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

        this._languageIntegration = new LanguageEditorIntegration(this, this._config, languageManager)

        this._languageIntegration.onShowHover.subscribe((hover) => {
            this._hoverRenderer.showQuickInfo(hover.hover, hover.errors)
        })

        this._languageIntegration.onHideHover.subscribe(() => {
            this._hoverRenderer.hideQuickInfo()
        })

        this._languageIntegration.onShowDefinition.subscribe((definition) => {
            UI.Actions.setDefinition(definition.token, definition.location)
        })

        this._languageIntegration.onHideDefinition.subscribe((definition) => {
            UI.Actions.hideDefinition()
        })

        this._render()

        const browserWindow = remote.getCurrentWindow()

        browserWindow.on("blur", () => {
            this._neovimInstance.autoCommands.executeAutoCommand("FocusLost")
        })

        browserWindow.on("focus", () => {
            this._neovimInstance.autoCommands.executeAutoCommand("FocusGained")
        })

        this._onConfigChanged(this._config.getValues())
        this._config.onConfigurationChanged.subscribe((newValues: Partial<IConfigurationValues>) => this._onConfigChanged(newValues))

        ipcRenderer.on("menu-item-click", (_evt: any, message: string) => {
            if (message.startsWith(":")) {
                this._neovimInstance.command("exec \"" + message + "\"")
            } else {
                this._neovimInstance.command("exec \":normal! " + message + "\"")
            }
        })

        const openFiles = async (files: string[], action: string) => {

            await this._neovimInstance.callFunction("OniOpenFile", [action, files[0]])

            for (let i = 1; i < files.length; i++) {
                this._neovimInstance.command("exec \"" + action + " " + normalizePath(files[i]) + "\"")
            }
        }

        ipcRenderer.on("open-files", (_evt: any, message: string, files: string[]) => {
            openFiles(files, message)
        })

        // enable opening a file via drag-drop
        document.ondragover = (ev) => {
            ev.preventDefault()
        }
        document.body.ondrop = (ev) => {
            ev.preventDefault()

            const files = ev.dataTransfer.files
            // open first file in current editor
            this._neovimInstance.open(normalizePath(files[0].path))
            // open any subsequent files in new tabs
            for (let i = 1; i < files.length; i++) {
                this._neovimInstance.command("exec \":tabe " + normalizePath(files.item(i).path) + "\"")
            }
        }
    }

    public dispose(): void {
        if (this._syntaxHighlighter) {
            this._syntaxHighlighter.dispose()
            this._syntaxHighlighter = null
        }

        if (this._languageIntegration) {
            this._languageIntegration.dispose()
            this._languageIntegration = null
        }

        if (this._colors) {
            this._colors.dispose()
            this._colors = null
        }

        if (this._completion) {
            this._completion.dispose()
            this._completion = null
        }

        // TODO: Implement full disposal logic
        this._popupMenu.dispose()
        this._popupMenu = null

        this._windowManager.dispose()
        this._windowManager = null
    }

    public async openFile(file: string): Promise<Oni.Buffer> {
        await this._neovimInstance.command(":e " + file)
        return this.activeBuffer
    }

    public executeCommand(command: string): void {
        commandManager.executeCommand(command, null)
    }

    public async init(filesToOpen: string[]): Promise<void> {
        const startOptions: INeovimStartOptions = {
            args: filesToOpen,
            runtimePaths: pluginManager.getAllRuntimePaths(),
            transport: configuration.getValue("experimental.neovim.transport"),
        }

        await this._neovimInstance.start(startOptions)
        VimConfigurationSynchronizer.synchronizeConfiguration(this._neovimInstance, this._config.getValues())

        this._themeManager.onThemeChanged.subscribe(() => {
            const newTheme = this._themeManager.activeTheme

            if (newTheme.baseVimTheme && newTheme.baseVimTheme !== this._currentColorScheme) {
                this._neovimInstance.command(":color " + newTheme.baseVimTheme)
            }
        })

        if (this._themeManager.activeTheme && this._themeManager.activeTheme.baseVimTheme) {
            await this._neovimInstance.command(":color " + this._themeManager.activeTheme.baseVimTheme)
        }

        this._hasLoaded = true
        this._isFirstRender = true
        this._scheduleRender()
    }

    public render(): JSX.Element {

        const onBufferClose = (bufferId: number) => {
            this._neovimInstance.command(`bw ${bufferId}`)
        }

        const onBufferSelect = (bufferId: number) => {
            this._neovimInstance.command(`buf ${bufferId}`)
        }

        const onTabClose = (tabId: number) => {
            this._neovimInstance.command(`tabclose ${tabId}`)
        }

        const onTabSelect = (tabId: number) => {
            this._neovimInstance.command(`tabn ${tabId}`)
        }

        const onKeyDown = (key: string) => {
            this._onKeyDown(key)
        }

        return <NeovimSurface renderer={this._renderer}
            typingPrediction={this._typingPredictionManager}
            neovimInstance={this._neovimInstance}
            screen={this._screen}
            onKeyDown={onKeyDown}
            onBufferClose={onBufferClose}
            onBufferSelect={onBufferSelect}
            onTabClose={onTabClose}
            onTabSelect={onTabSelect} />
    }

    private _onModeChanged(newMode: string): void {

        this._typingPredictionManager.clearAllPredictions()

        if (newMode === "insert" && configuration.getValue("experimental.editor.typingPrediction")) {
            this._typingPredictionManager.enable()
        } else {
            this._typingPredictionManager.disable()
        }

        UI.Actions.setMode(newMode)
        this.setMode(newMode as Oni.Vim.Mode)

        if (newMode === "insert") {
            this._syntaxHighlighter.notifyStartInsertMode(this.activeBuffer)
        } else {
            this._syntaxHighlighter.notifyEndInsertMode(this.activeBuffer)
        }
    }

    private _onVimEvent(eventName: string, evt: EventContext): void {
        UI.Actions.setWindowCursor(evt.windowNumber, evt.line - 1, evt.column - 1)

        // Convert to 0-based positions
        this._syntaxHighlighter.notifyViewportChanged(evt.bufferNumber.toString(), evt.windowTopLine - 1, evt.windowBottomLine - 1)

        const lastBuffer = this.activeBuffer
        const buf = this._bufferManager.updateBufferFromEvent(evt)

        if (eventName === "BufEnter") {
            if (lastBuffer && lastBuffer.filePath !== buf.filePath) {
                this.notifyBufferLeave({
                    filePath: lastBuffer.filePath,
                    language: lastBuffer.language,
                })
            }

            this._lastBufferId = evt.bufferNumber.toString()
            this.notifyBufferEnter(buf)

            UI.Actions.bufferEnter(evt.bufferNumber, evt.bufferFullPath, evt.filetype, evt.bufferTotalLines, evt.hidden, evt.listed)
        } else if (eventName === "BufWritePost") {
            // After we save we aren't modified... but we can pass it in just to be safe
            UI.Actions.bufferSave(evt.bufferNumber, evt.modified, evt.version)

            this.notifyBufferSaved({
                filePath: evt.bufferFullPath,
                language: evt.filetype,
            })
        } else if (eventName === "BufDelete") {

            this._neovimInstance.getBufferIds()
                .then((ids) => UI.Actions.setCurrentBuffers(ids))
        }
    }

    private _onConfigChanged(newValues: Partial<IConfigurationValues>): void {
        const fontFamily = this._config.getValue("editor.fontFamily")
        const fontSize = this._config.getValue("editor.fontSize")
        const linePadding = this._config.getValue("editor.linePadding")

        UI.Actions.setFont(fontFamily, fontSize)
        this._neovimInstance.setFont(fontFamily, fontSize, linePadding)

        if (this._hasLoaded) {
            VimConfigurationSynchronizer.synchronizeConfiguration(this._neovimInstance, newValues)
        }

        this._isFirstRender = true

        this._scheduleRender()
    }

    private async _onColorsChanged(): Promise<void> {
        const newColorScheme = await this._neovimInstance.eval<string>("g:colors_name")
        this._currentColorScheme = newColorScheme
        const backgroundColor = this._screen.backgroundColor
        const foregroundColor = this._screen.foregroundColor

        Log.info(`[NeovimEditor] Colors changed: ${newColorScheme} - background: ${backgroundColor} foreground: ${foregroundColor}`)

        this._themeManager.notifyVimThemeChanged(newColorScheme, backgroundColor, foregroundColor)

        // Flip first render to force a full redraw
        this._isFirstRender = true
        this._scheduleRender()
    }

    private _scheduleRender(): void {
        if (this._pendingAnimationFrame) {
            return
        }

        this._pendingAnimationFrame = true
        window.requestAnimationFrame(() => this._render())
    }

    private _render(): void {
        this._pendingAnimationFrame = false

        if (this._hasLoaded) {
            if (this._isFirstRender) {
                this._isFirstRender = false
                this._renderer.redrawAll(this._screen)
            } else {
                this._renderer.draw(this._screen)
            }
        }
    }

    private async _onKeyDown(key: string): Promise<void> {
        if (configuration.getValue("debug.fakeLag.neovimInput")) {
            await sleep(configuration.getValue("debug.fakeLag.neovimInput"))
        }

        await this._neovimInstance.input(key)
    }
}
