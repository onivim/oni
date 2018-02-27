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

import * as types from "vscode-languageserver-types"

import { Provider } from "react-redux"
import { bindActionCreators, Store } from "redux"

import { clipboard, ipcRenderer, remote } from "electron"

import * as Oni from "oni-api"
import { Event } from "oni-types"

import * as Log from "./../../Log"

import { addDefaultUnitIfNeeded } from "./../../Font"
import {
    BufferEventContext,
    EventContext,
    INeovimStartOptions,
    NeovimInstance,
    NeovimScreen,
    NeovimWindowManager,
} from "./../../neovim"
import { CanvasRenderer, INeovimRenderer } from "./../../Renderer"

import { PluginManager } from "./../../Plugins/PluginManager"

import { IColors } from "./../../Services/Colors"
import { commandManager } from "./../../Services/CommandManager"
import { Completion, CompletionProviders } from "./../../Services/Completion"
import { Configuration, IConfigurationValues } from "./../../Services/Configuration"
import { IDiagnosticsDataSource } from "./../../Services/Diagnostics"
import { editorManager } from "./../../Services/EditorManager"
import { Errors } from "./../../Services/Errors"
import { Overlay, OverlayManager } from "./../../Services/Overlay"
import { SnippetManager } from "./../../Services/Snippets"
import { TokenColors } from "./../../Services/TokenColors"

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

import { MenuManager } from "./../../Services/Menu"
import { Tasks } from "./../../Services/Tasks"
import { ThemeManager } from "./../../Services/Themes"
import { TypingPredictionManager } from "./../../Services/TypingPredictionManager"
import { Workspace } from "./../../Services/Workspace"

import { Editor, IEditor } from "./../Editor"

import { BufferManager, IBuffer } from "./../BufferManager"
import { CompletionMenu } from "./CompletionMenu"
import { HoverRenderer } from "./HoverRenderer"
import { NeovimPopupMenu } from "./NeovimPopupMenu"
import NeovimSurface from "./NeovimSurface"

import { ContextMenuManager } from "./../../Services/ContextMenu"

import { normalizePath, sleep } from "./../../Utility"

import * as VimConfigurationSynchronizer from "./../../Services/VimConfigurationSynchronizer"

import { BufferLayerManager } from "./BufferLayerManager"
import { Definition } from "./Definition"
import * as ActionCreators from "./NeovimEditorActions"
import { NeovimEditorCommands } from "./NeovimEditorCommands"
import { createStore, IState, ITab } from "./NeovimEditorStore"
import { Rename } from "./Rename"
import { Symbols } from "./Symbols"
import { IToolTipsProvider, NeovimEditorToolTipsProvider } from "./ToolTipsProvider"

import CommandLine from "./../../UI/components/CommandLine"
import ExternalMenus from "./../../UI/components/ExternalMenus"
import WildMenu from "./../../UI/components/WildMenu"

import { WelcomeBufferLayer } from "./WelcomeBufferLayer"

import { getInstance as getNotificationsInstance } from "./../../Services/Notifications"

export class NeovimEditor extends Editor implements IEditor {
    private _bufferManager: BufferManager
    private _neovimInstance: NeovimInstance
    private _renderer: INeovimRenderer
    private _screen: NeovimScreen
    private _completionMenu: CompletionMenu
    private _contextMenuManager: ContextMenuManager
    private _popupMenu: NeovimPopupMenu
    private _errorInitializing: boolean = false

    private _store: Store<IState>
    private _actions: typeof ActionCreators

    private _pendingAnimationFrame: boolean = false

    private _onEnterEvent: Event<void> = new Event<void>()

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
    private _rename: Rename = null
    private _symbols: Symbols = null
    private _definition: Definition = null
    private _toolTipsProvider: IToolTipsProvider
    private _commands: NeovimEditorCommands
    private _externalMenuOverlay: Overlay

    private _bufferLayerManager: BufferLayerManager

    public get /* override */ activeBuffer(): Oni.Buffer {
        return this._bufferManager.getBufferById(this._lastBufferId)
    }

    // Capabilities
    public get neovim(): Oni.NeovimEditorCapability {
        return this._neovimInstance
    }

    public get bufferLayers(): BufferLayerManager {
        return this._bufferLayerManager
    }

    public get syntaxHighlighter(): ISyntaxHighlighter {
        return this._syntaxHighlighter
    }

    constructor(
        private _colors: IColors,
        private _completionProviders: CompletionProviders,
        private _configuration: Configuration,
        private _diagnostics: IDiagnosticsDataSource,
        private _languageManager: LanguageManager,
        private _menuManager: MenuManager,
        private _overlayManager: OverlayManager,
        private _pluginManager: PluginManager,
        private _snippetManager: SnippetManager,
        private _tasks: Tasks,
        private _themeManager: ThemeManager,
        private _tokenColors: TokenColors,
        private _workspace: Workspace,
    ) {
        super()

        const services: any[] = []

        this._store = createStore()
        this._actions = bindActionCreators(ActionCreators as any, this._store.dispatch)
        this._toolTipsProvider = new NeovimEditorToolTipsProvider(this._actions)

        this._bufferLayerManager = new BufferLayerManager()

        this._contextMenuManager = new ContextMenuManager(this._toolTipsProvider, this._colors)

        this._neovimInstance = new NeovimInstance(100, 100, this._configuration)
        this._bufferManager = new BufferManager(this._neovimInstance, this._actions, this._store)
        this._screen = new NeovimScreen()

        this._hoverRenderer = new HoverRenderer(
            this._colors,
            this,
            this._configuration,
            this._toolTipsProvider,
        )

        this._definition = new Definition(this, this._store)
        this._symbols = new Symbols(
            this,
            this._definition,
            this._languageManager,
            this._menuManager,
        )

        this._diagnostics.onErrorsChanged.subscribe(() => {
            const errors = this._diagnostics.getErrors()
            this._actions.setErrors(errors)
        })

        this._externalMenuOverlay = this._overlayManager.createItem()
        this._externalMenuOverlay.setContents(
            <Provider store={this._store}>
                <ExternalMenus>
                    <CommandLine />
                    <WildMenu />
                </ExternalMenus>
            </Provider>,
        )

        this._popupMenu = new NeovimPopupMenu(
            this._neovimInstance.onShowPopupMenu,
            this._neovimInstance.onHidePopupMenu,
            this._neovimInstance.onSelectPopupMenu,
            this.onBufferEnter,
            this._colors,
            this._toolTipsProvider,
        )

        this._neovimInstance.onMessage.subscribe(messageInfo => {
            // TODO: Hook up real notifications
            const notificationManager = getNotificationsInstance()
            const notification = notificationManager.createItem()
            notification.setLevel("error")
            notification.setContents(messageInfo.title, messageInfo.details)
            notification.onClick.subscribe(() =>
                commandManager.executeCommand("oni.config.openInitVim"),
            )
            notification.show()
        })

        this._renderer = new CanvasRenderer()

        this._rename = new Rename(
            this,
            this._languageManager,
            this._toolTipsProvider,
            this._workspace,
        )

        // Services
        const errorService = new Errors(this._neovimInstance)

        this._commands = new NeovimEditorCommands(
            commandManager,
            this._contextMenuManager,
            this._definition,
            this._languageIntegration,
            this._menuManager,
            this._neovimInstance,
            this._rename,
            this._symbols,
        )

        this._tasks.registerTaskProvider(commandManager)
        this._tasks.registerTaskProvider(errorService)

        services.push(errorService)

        const onColorsChanged = () => {
            const updatedColors: any = this._colors.getColors()
            this._actions.setColors(updatedColors)
        }

        this._colors.onColorsChanged.subscribe(() => onColorsChanged())
        onColorsChanged()

        const onTokenColorschanged = () => {
            if (this._neovimInstance.isInitialized) {
                this._neovimInstance.tokenColorSynchronizer.synchronizeTokenColors(
                    this._tokenColors.tokenColors,
                )
            }
        }

        this._tokenColors.onTokenColorsChanged.subscribe(() => onTokenColorschanged())

        // Overlays
        // TODO: Replace `OverlayManagement` concept and associated window management code with
        // explicit window management: #362
        this._windowManager = new NeovimWindowManager(this._neovimInstance)
        this._neovimInstance.onCommandLineShow.subscribe(showCommandLineInfo => {
            this._actions.showCommandLine(
                showCommandLineInfo.content,
                showCommandLineInfo.pos,
                showCommandLineInfo.firstc,
                showCommandLineInfo.prompt,
                showCommandLineInfo.indent,
                showCommandLineInfo.level,
            )
            this._externalMenuOverlay.show()
        })

        this._neovimInstance.onWildMenuShow.subscribe(wildMenuInfo => {
            this._actions.showWildMenu(wildMenuInfo)
        })

        this._neovimInstance.onWildMenuSelect.subscribe(wildMenuInfo => {
            this._actions.wildMenuSelect(wildMenuInfo)
        })

        this._neovimInstance.onWildMenuHide.subscribe(() => {
            this._actions.hideWildMenu()
        })

        this._neovimInstance.onCommandLineHide.subscribe(() => {
            this._actions.hideCommandLine()
            this._externalMenuOverlay.hide()
        })

        this._neovimInstance.onCommandLineSetCursorPosition.subscribe(commandLinePos => {
            this._actions.setCommandLinePosition(commandLinePos)
        })

        this._windowManager.onWindowStateChanged.subscribe(tabPageState => {
            const filteredTabState = tabPageState.inactiveWindows.filter(w => !!w)
            const inactiveIds = filteredTabState.map(w => w.windowNumber)

            this._actions.setActiveVimTabPage(tabPageState.tabId, [
                tabPageState.activeWindow.windowNumber,
                ...inactiveIds,
            ])

            const { activeWindow } = tabPageState
            if (activeWindow) {
                this._actions.setWindowState(
                    activeWindow.windowNumber,
                    activeWindow.bufferId,
                    activeWindow.bufferFullPath,
                    activeWindow.column,
                    activeWindow.line,
                    activeWindow.bottomBufferLine,
                    activeWindow.topBufferLine,
                    activeWindow.dimensions,
                    activeWindow.bufferToScreen,
                )
            }

            filteredTabState.map(w => {
                this._actions.setInactiveWindowState(w.windowNumber, w.dimensions)
            })
        })

        this._neovimInstance.onYank.subscribe(yankInfo => {
            if (this._configuration.getValue("editor.clipboard.enabled")) {
                const isYankAndAllowed =
                    yankInfo.operator === "y" &&
                    this._configuration.getValue("editor.clipboard.synchronizeYank")
                const isDeleteAndAllowed =
                    yankInfo.operator === "d" &&
                    this._configuration.getValue("editor.clipboard.synchronizeDelete")
                const isAllowed = isYankAndAllowed || isDeleteAndAllowed

                if (isAllowed) {
                    clipboard.writeText(yankInfo.regcontents.join(require("os").EOL))
                }
            }
        })

        this._neovimInstance.onTitleChanged.subscribe(newTitle => {
            const title = newTitle.replace(" - NVIM", " - ONI")
            Shell.Actions.setWindowTitle(title)
        })

        this._neovimInstance.onLeave.subscribe(() => {
            // TODO: Only leave if all editors are closed...
            if (!this._configuration.getValue("debug.persistOnNeovimExit")) {
                remote.getCurrentWindow().close()
            }
        })

        this._neovimInstance.onOniCommand.subscribe(command => {
            commandManager.executeCommand(command)
        })

        this._neovimInstance.on("event", (eventName: string, evt: any) => {
            const current = evt.current || evt
            this._updateWindow(current)
            this._bufferManager.updateBufferFromEvent(current)
        })

        this._neovimInstance.autoCommands.onBufDelete.subscribe((evt: BufferEventContext) =>
            this._onBufDelete(evt),
        )

        this._neovimInstance.autoCommands.onBufUnload.subscribe((evt: BufferEventContext) =>
            this._onBufUnload(evt),
        )

        this._neovimInstance.autoCommands.onBufEnter.subscribe((evt: BufferEventContext) =>
            this._onBufEnter(evt),
        )

        this._neovimInstance.autoCommands.onBufWipeout.subscribe((evt: BufferEventContext) =>
            this._onBufWipeout(evt),
        )

        this._neovimInstance.autoCommands.onBufWritePost.subscribe((evt: EventContext) =>
            this._onBufWritePost(evt),
        )

        this._neovimInstance.onColorsChanged.subscribe(() => {
            this._onColorsChanged()
        })

        this._neovimInstance.onError.subscribe(err => {
            this._errorInitializing = true
            this._actions.setNeovimError(true)
        })

        // These functions are mirrors of each other if vim changes dir then oni responds
        // and if oni initiates the dir change then we inform vim
        // NOTE: the gates to check that the dirs being passed aren't already set prevent
        // an infinite loop!!
        this._neovimInstance.onDirectoryChanged.subscribe(async newDirectory => {
            if (newDirectory !== this._workspace.activeWorkspace) {
                await this._workspace.changeDirectory(newDirectory)
            }
        })

        this._workspace.onDirectoryChanged.subscribe(async newDirectory => {
            if (newDirectory !== this._neovimInstance.currentVimDirectory) {
                await this._neovimInstance.chdir(newDirectory)
            }
        })

        this._neovimInstance.on("action", (action: any) => {
            this._renderer.onAction(action)
            this._screen.dispatch(action)

            this._scheduleRender()
        })

        this._neovimInstance.onRedrawComplete.subscribe(() => {
            const isCursorInCommandRow = this._screen.cursorRow === this._screen.height - 1
            const isCommandLineMode = this.mode && this.mode.indexOf("cmdline") === 0

            // In some cases, during redraw, Neovim will actually set the cursor position
            // to the command line when rendering. This can happen when 'echo'ing or
            // when a popumenu is enabled, and text is writing.
            //
            // We should ignore those cases, and only set the cursor in the command row
            // when we're actually in command line mode. See #1265 for more context.
            if (!isCursorInCommandRow || (isCursorInCommandRow && isCommandLineMode)) {
                this._actions.setCursorPosition(this._screen)
                this._typingPredictionManager.setCursorPosition(this._screen)
            }
        })

        this._neovimInstance.on("tabline-update", async (currentTabId: number, tabs: ITab[]) => {
            const atomicCalls = tabs.map((tab: ITab) => {
                return ["nvim_call_function", ["tabpagebuflist", [tab.id]]]
            })

            const response = await this._neovimInstance.request("nvim_call_atomic", [atomicCalls])

            tabs.map((tab: ITab, index: number) => {
                tab.buffersInTab = response[0][index] instanceof Array ? response[0][index] : []
            })

            this._actions.setTabs(currentTabId, tabs)
        })

        this._cursorMoved$ = this._neovimInstance.autoCommands.onCursorMoved
            .asObservable()
            .map((evt): Oni.Cursor => ({
                line: evt.line - 1,
                column: evt.column - 1,
            }))

        this._cursorMovedI$ = this._neovimInstance.autoCommands.onCursorMovedI
            .asObservable()
            .map((evt): Oni.Cursor => ({
                line: evt.line - 1,
                column: evt.column - 1,
            }))

        Observable.merge(this._cursorMoved$, this._cursorMovedI$).subscribe(cursorMoved => {
            this.notifyCursorMoved(cursorMoved)
        })

        this._modeChanged$ = this._neovimInstance.onModeChanged.asObservable()
        this._neovimInstance.onModeChanged.subscribe(newMode => this._onModeChanged(newMode))

        this._neovimInstance.onBufferUpdate.subscribe(update => {
            const buffer = this._bufferManager.updateBufferFromEvent(update.eventContext)

            const bufferUpdate = {
                context: update.eventContext,
                buffer,
                contentChanges: update.contentChanges,
            }

            this.notifyBufferChanged(bufferUpdate)
            this._actions.bufferUpdate(
                parseInt(bufferUpdate.buffer.id, 10),
                bufferUpdate.buffer.modified,
                bufferUpdate.buffer.lineCount,
            )

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

        addInsertModeLanguageFunctionality(
            this._cursorMovedI$,
            this._modeChanged$,
            this._toolTipsProvider,
        )

        const textMateHighlightingEnabled = this._configuration.getValue(
            "editor.textMateHighlighting.enabled",
        )
        this._syntaxHighlighter = textMateHighlightingEnabled
            ? new SyntaxHighlighter(this, this._tokenColors)
            : new NullSyntaxHighlighter()

        this._completion = new Completion(
            this,
            this._configuration,
            this._completionProviders,
            this._languageManager,
            this._snippetManager,
        )
        this._completionMenu = new CompletionMenu(this._contextMenuManager.create())

        this._completion.onShowCompletionItems.subscribe(completions => {
            this._completionMenu.show(completions.filteredCompletions, completions.base)
        })

        this._completion.onHideCompletionItems.subscribe(completions => {
            this._completionMenu.hide()
        })

        this._completionMenu.onItemFocused.subscribe(item => {
            this._completion.resolveItem(item)
        })

        this._completionMenu.onItemSelected.subscribe(item => {
            this._completion.commitItem(item)
        })

        this._languageIntegration = new LanguageEditorIntegration(
            this,
            this._configuration,
            this._languageManager,
        )

        this._languageIntegration.onShowHover.subscribe(async hover => {
            const { cursorPixelX, cursorPixelY } = this._store.getState()
            await this._hoverRenderer.showQuickInfo(
                cursorPixelX,
                cursorPixelY,
                hover.hover,
                hover.errors,
            )
        })

        this._languageIntegration.onHideHover.subscribe(() => {
            this._hoverRenderer.hideQuickInfo()
        })

        this._languageIntegration.onShowDefinition.subscribe(definition => {
            this._actions.setDefinition(definition.token, definition.location)
        })

        this._languageIntegration.onHideDefinition.subscribe(definition => {
            this._actions.hideDefinition()
        })

        this._render()

        const browserWindow = remote.getCurrentWindow()

        browserWindow.on("blur", () => {
            this._neovimInstance.autoCommands.executeAutoCommand("FocusLost")
        })

        browserWindow.on("focus", () => {
            this._neovimInstance.autoCommands.executeAutoCommand("FocusGained")

            // If the user has autoread enabled, we should run ":checktime" on
            // focus, as this is needed to get the file to auto-update.
            // https://github.com/neovim/neovim/issues/1936
            if (_configuration.getValue("vim.setting.autoread")) {
                this._neovimInstance.command(":checktime")
            }
        })

        this._onConfigChanged(this._configuration.getValues())
        this._configuration.onConfigurationChanged.subscribe(
            (newValues: Partial<IConfigurationValues>) => this._onConfigChanged(newValues),
        )

        ipcRenderer.on("menu-item-click", (_evt: any, message: string) => {
            if (message.startsWith(":")) {
                this._neovimInstance.command('exec "' + message + '"')
            } else {
                this._neovimInstance.command('exec ":normal! ' + message + '"')
            }
        })

        ipcRenderer.on("open-files", (_evt: any, message: string, files: string[]) => {
            this._openFiles(files, message)
        })

        ipcRenderer.on("open-file", (_evt: any, path: string) => {
            this._neovimInstance.command(`:e! ${path}`)
        })

        // enable opening a file via drag-drop
        document.ondragover = ev => {
            ev.preventDefault()
        }
        document.body.ondrop = ev => {
            ev.preventDefault()

            const files = ev.dataTransfer.files
            // open first file in current editor
            this._neovimInstance.open(normalizePath(files[0].path))
            // open any subsequent files in new tabs
            for (let i = 1; i < files.length; i++) {
                this._neovimInstance.command(
                    'exec ":tabe ' + normalizePath(files.item(i).path) + '"',
                )
            }
        }
    }

    public async blockInput(
        inputFunction: (inputCallback: Oni.InputCallbackFunction) => Promise<void>,
    ): Promise<void> {
        return this._neovimInstance.blockInput(inputFunction)
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

    public enter(): void {
        editorManager.setActiveEditor(this)
        Log.info("[NeovimEditor::enter]")
        this._onEnterEvent.dispatch()
        this._actions.setHasFocus(true)
        this._commands.activate()
    }

    public leave(): void {
        Log.info("[NeovimEditor::leave]")
        this._actions.setHasFocus(false)
        this._commands.deactivate()
    }

    public async clearSelection(): Promise<void> {
        await this._neovimInstance.input("<esc>")
        await this._neovimInstance.input("a")
    }

    public async setSelection(range: types.Range): Promise<void> {
        await this._neovimInstance.input("<esc>")

        const atomicCalls = [
            [
                "nvim_call_function",
                ["setpos", ["'<", [0, range.start.line + 1, range.start.character + 1]]],
            ],
            [
                "nvim_call_function",
                ["setpos", ["'>", [0, range.end.line + 1, range.end.character + 1]]],
            ],
            ["nvim_command", ["set selectmode=cmd"]],
            ["nvim_command", ["normal! gv"]],
            ["nvim_command", ["set selectmode="]],
        ]

        await this._neovimInstance.request("nvim_call_atomic", [atomicCalls])
    }

    public async openFile(
        file: string,
        openOptions: Oni.FileOpenOptions = Oni.DefaultFileOpenOptions,
    ): Promise<Oni.Buffer> {
        const cmd = new Proxy(
            {
                [Oni.FileOpenMode.NewTab]: "tabnew!",
                [Oni.FileOpenMode.HorizontalSplit]: "sp!",
                [Oni.FileOpenMode.VerticalSplit]: "vsp!",
                [Oni.FileOpenMode.Edit]: "tab drop",
                [Oni.FileOpenMode.ExistingTab]: "e!",
            },
            {
                get: (target: { [cmd: string]: string }, name: string) =>
                    name in target ? target[name] : "e!",
            },
        )

        await this._neovimInstance.command(`:${cmd[openOptions.openMode]} ${file}`)
        return this.activeBuffer
    }

    public async newFile(filePath: string): Promise<Oni.Buffer> {
        await this._neovimInstance.command(":vsp " + filePath)
        const context = await this._neovimInstance.getContext()
        const buffer = this._bufferManager.updateBufferFromEvent(context)
        return buffer
    }

    public executeCommand(command: string): void {
        commandManager.executeCommand(command, null)
    }

    public async init(filesToOpen: string[]): Promise<void> {
        Log.info("[NeovimEditor::init] Called with filesToOpen: " + filesToOpen)
        const startOptions: INeovimStartOptions = {
            runtimePaths: this._pluginManager.getAllRuntimePaths(),
            transport: this._configuration.getValue("experimental.neovim.transport"),
            neovimPath: this._configuration.getValue("debug.neovimPath"),
            loadInitVim: this._configuration.getValue("oni.loadInitVim"),
            useDefaultConfig: this._configuration.getValue("oni.useDefaultConfig"),
        }

        await this._neovimInstance.start(startOptions)

        if (this._errorInitializing) {
            return
        }

        VimConfigurationSynchronizer.synchronizeConfiguration(
            this._neovimInstance,
            this._configuration.getValues(),
        )

        this._themeManager.onThemeChanged.subscribe(() => {
            const newTheme = this._themeManager.activeTheme

            if (newTheme.baseVimTheme && newTheme.baseVimTheme !== this._currentColorScheme) {
                this._neovimInstance.command(":color " + newTheme.baseVimTheme)
            }
        })

        if (this._themeManager.activeTheme && this._themeManager.activeTheme.baseVimTheme) {
            await this._neovimInstance.command(
                ":color " + this._themeManager.activeTheme.baseVimTheme,
            )
        }

        if (filesToOpen && filesToOpen.length > 0) {
            await this._openFiles(filesToOpen, ":tabnew")
        } else {
            if (this._configuration.getValue("experimental.welcome.enabled")) {
                const buf = await this.openFile("WELCOME")
                buf.addLayer(new WelcomeBufferLayer())
            }
        }

        this._actions.setLoadingComplete()

        this._hasLoaded = true
        this._isFirstRender = true
        this._scheduleRender()
    }

    public getBuffers(): Array<Oni.Buffer | Oni.InactiveBuffer> {
        return this._bufferManager.getBuffers()
    }

    public async bufferDelete(bufferId: string = this.activeBuffer.id): Promise<void> {
        // FIXME: currently this command forces a bufEnter event by navigating away
        // from the closed buffer which is currently the only means of updating Oni
        // post a BufDelete event
        await this._neovimInstance.command(`bd ${bufferId}`)
        if (bufferId === "%" || bufferId === this.activeBuffer.id) {
            await this._neovimInstance.command(`bnext`)
        } else {
            await this._neovimInstance.command(`bnext`)
            await this._neovimInstance.command(`bprev`)
        }
    }

    public render(): JSX.Element {
        const onBufferClose = (bufferId: number) => {
            this._neovimInstance.command(`bw! ${bufferId}`)
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
            this.input(key)
        }

        return (
            <Provider store={this._store}>
                <NeovimSurface
                    renderer={this._renderer}
                    typingPrediction={this._typingPredictionManager}
                    neovimInstance={this._neovimInstance}
                    screen={this._screen}
                    onActivate={this._onEnterEvent}
                    onKeyDown={onKeyDown}
                    onBufferClose={onBufferClose}
                    onBufferSelect={onBufferSelect}
                    onBounceStart={() => this._onBounceStart()}
                    onBounceEnd={() => this._onBounceEnd()}
                    onImeStart={() => this._onImeStart()}
                    onImeEnd={() => this._onImeEnd()}
                    onTabClose={onTabClose}
                    onTabSelect={onTabSelect}
                />
            </Provider>
        )
    }

    public async input(key: string): Promise<void> {
        if (this._configuration.getValue("debug.fakeLag.neovimInput")) {
            await sleep(this._configuration.getValue("debug.fakeLag.neovimInput"))
        }

        // Check if any of the buffer layers can handle the input...
        const buf: IBuffer = this.activeBuffer as IBuffer
        const result = buf && buf.handleInput(key)

        if (result) {
            return
        }

        await this._neovimInstance.input(key)
    }

    private _onBounceStart(): void {
        this._actions.setCursorScale(1.1)
    }

    private _onBounceEnd(): void {
        this._actions.setCursorScale(1.0)
    }

    private async _openFiles(files: string[], action: string): Promise<void> {
        if (!files) {
            return
        }

        await this._neovimInstance.callFunction("OniOpenFile", [action, files[0]])

        for (let i = 1; i < files.length; i++) {
            await this._neovimInstance.command(
                'exec "' + action + " " + normalizePath(files[i]) + '"',
            )
        }
    }

    private _onModeChanged(newMode: string): void {
        // 'Bounce' the cursor for show match
        if (newMode === "showmatch") {
            this._actions.setCursorScale(0.9)
        }

        this._typingPredictionManager.clearAllPredictions()

        if (newMode === "insert" && this._configuration.getValue("editor.typingPrediction")) {
            this._typingPredictionManager.enable()
        } else {
            this._typingPredictionManager.disable()
        }

        this._actions.setMode(newMode)
        this.setMode(newMode as Oni.Vim.Mode)
    }

    private _updateWindow(currentBuffer: EventContext) {
        this._actions.setWindowCursor(
            currentBuffer.windowNumber,
            currentBuffer.line - 1,
            currentBuffer.column - 1,
        )
        // Convert to 0-based positions
        this._syntaxHighlighter.notifyViewportChanged(
            currentBuffer.bufferNumber.toString(),
            currentBuffer.windowTopLine - 1,
            currentBuffer.windowBottomLine - 1,
        )
    }

    private async _onBufEnter(evt: BufferEventContext): Promise<void> {
        const buf = this._bufferManager.updateBufferFromEvent(evt.current)
        this._bufferManager.populateBufferList(evt)
        this._workspace.autoDetectWorkspace(buf.filePath)

        const lastBuffer = this.activeBuffer
        if (lastBuffer && lastBuffer.filePath !== buf.filePath) {
            this.notifyBufferLeave({
                filePath: lastBuffer.filePath,
                language: lastBuffer.language,
            })
        }
        this._lastBufferId = evt.current.bufferNumber.toString()
        this.notifyBufferEnter(buf)
        this._bufferLayerManager.notifyBufferEnter(buf)

        // Existing buffers contains a duplicate current buffer object which should be filtered out
        // and current buffer sent instead. Finally Filter out falsy viml values.
        const existingBuffersWithoutCurrent = evt.existingBuffers.filter(
            b => b.bufferNumber !== evt.current.bufferNumber,
        )
        const buffers = [evt.current, ...existingBuffersWithoutCurrent].filter(b => !!b)

        this._actions.bufferEnter(buffers)
    }

    private _onImeStart(): void {
        this._actions.setImeActive(true)
    }

    private _onImeEnd(): void {
        this._actions.setImeActive(false)
    }

    private async _onBufWritePost(evt: EventContext): Promise<void> {
        // After we save we aren't modified... but we can pass it in just to be safe
        this._actions.bufferSave(evt.bufferNumber, evt.modified, evt.version)

        this.notifyBufferSaved({
            filePath: evt.bufferFullPath,
            language: evt.filetype,
        })
    }

    private async _onBufUnload(evt: BufferEventContext): Promise<void> {
        this._bufferManager.populateBufferList(evt)
        this._neovimInstance.getBufferIds().then(ids => this._actions.setCurrentBuffers(ids))
    }

    private async _onBufDelete(evt: BufferEventContext): Promise<void> {
        this._bufferManager.populateBufferList(evt)
        this._neovimInstance.getBufferIds().then(ids => this._actions.setCurrentBuffers(ids))
    }

    private async _onBufWipeout(evt: BufferEventContext): Promise<void> {
        this._bufferManager.populateBufferList(evt)
        this._neovimInstance.getBufferIds().then(ids => this._actions.setCurrentBuffers(ids))
    }

    private _onConfigChanged(newValues: Partial<IConfigurationValues>): void {
        const fontFamily = this._configuration.getValue("editor.fontFamily")
        const fontSize = addDefaultUnitIfNeeded(this._configuration.getValue("editor.fontSize"))
        const linePadding = this._configuration.getValue("editor.linePadding")

        this._actions.setFont(fontFamily, fontSize)
        this._neovimInstance.setFont(fontFamily, fontSize, linePadding)

        Object.keys(newValues).forEach(key => {
            const value = newValues[key]
            this._actions.setConfigValue(key, value)
        })

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

        Log.info(
            `[NeovimEditor] Colors changed: ${newColorScheme} - background: ${backgroundColor} foreground: ${foregroundColor}`,
        )

        this._themeManager.notifyVimThemeChanged(newColorScheme, backgroundColor, foregroundColor)

        const tokenColors = await this._neovimInstance.getTokenColors()
        this._tokenColors.setDefaultTokenColors(tokenColors)

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
}
