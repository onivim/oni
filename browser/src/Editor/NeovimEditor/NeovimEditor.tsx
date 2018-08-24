/**
 * NeovimEditor.ts
 *
 * Editor implementation for Neovim
 */

import * as os from "os"
import * as React from "react"

import "rxjs/add/observable/defer"
import "rxjs/add/observable/merge"
import "rxjs/add/operator/map"
import "rxjs/add/operator/mergeMap"
import { Observable } from "rxjs/Observable"

import * as types from "vscode-languageserver-types"

import { Provider } from "react-redux"
import { bindActionCreators, Store } from "redux"

import { clipboard, ipcRenderer } from "electron"

import * as Oni from "oni-api"
import * as Log from "oni-core-logging"
import { Event, IEvent } from "oni-types"

import { addDefaultUnitIfNeeded } from "./../../Font"
import {
    BufferEventContext,
    EventContext,
    INeovimStartOptions,
    NeovimInstance,
    NeovimScreen,
    NeovimWindowManager,
    ScreenWithPredictions,
} from "./../../neovim"
import { INeovimRenderer } from "./../../Renderer"

import { PluginManager } from "./../../Plugins/PluginManager"

import { IColors } from "./../../Services/Colors"
import { commandManager } from "./../../Services/CommandManager"
import { Completion, CompletionProviders } from "./../../Services/Completion"
import { Configuration, IConfigurationValues } from "./../../Services/Configuration"
import { IDiagnosticsDataSource } from "./../../Services/Diagnostics"
import { Overlay, OverlayManager } from "./../../Services/Overlay"
import { ISession } from "./../../Services/Sessions"
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
import { IThemeMetadata, ThemeManager } from "./../../Services/Themes"
import { TypingPredictionManager } from "./../../Services/TypingPredictionManager"
import { Workspace } from "./../../Services/Workspace"

import { Editor } from "./../Editor"

import { BufferManager, IBuffer } from "./../BufferManager"
import { CompletionMenu } from "./CompletionMenu"
import { HoverRenderer } from "./HoverRenderer"
import { NeovimPopupMenu } from "./NeovimPopupMenu"
import NeovimSurface from "./NeovimSurface"

import { ContextMenuManager } from "./../../Services/ContextMenu"

import { asObservable, normalizePath, sleep } from "./../../Utility"

import * as VimConfigurationSynchronizer from "./../../Services/VimConfigurationSynchronizer"

import getLayerManagerInstance from "./BufferLayerManager"
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

// import { WelcomeBufferLayer } from "./WelcomeBufferLayer"

import { CanvasRenderer } from "../../Renderer/CanvasRenderer"
import { WebGLRenderer } from "../../Renderer/WebGL/WebGLRenderer"
import { getInstance as getNotificationsInstance } from "./../../Services/Notifications"

type NeovimError = [number, string]

export class NeovimEditor extends Editor implements Oni.Editor {
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
    private _onScroll$: Observable<Oni.EditorBufferScrolledEventArgs>

    private _hasLoaded: boolean = false

    private _windowManager: NeovimWindowManager

    private _currentColorScheme: string = ""
    private _currentBackground: string = ""
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
    private _bufferLayerManager = getLayerManagerInstance()
    private _screenWithPredictions: ScreenWithPredictions

    private _onEmptyBuffer = new Event<void>()
    private _onNeovimQuit: Event<void> = new Event<void>()

    private _autoFocus: boolean = true

    public get onNeovimQuit(): IEvent<void> {
        return this._onNeovimQuit
    }

    public get onEmptyBuffer() {
        return this._onEmptyBuffer
    }

    public get /* override */ activeBuffer(): Oni.Buffer {
        return this._bufferManager.getBufferById(this._lastBufferId)
    }

    // Capabilities
    public get neovim(): Oni.NeovimEditorCapability {
        return this._neovimInstance
    }

    public get bufferLayers() {
        return this._bufferLayerManager
    }

    /**
     * Gets whether or not the editor should autoFocus,
     * meaning, grab focus on first mount
     */
    public get autoFocus(): boolean {
        return this._autoFocus
    }
    public set autoFocus(val: boolean) {
        this._autoFocus = val
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
        private _themeManager: ThemeManager,
        private _tokenColors: TokenColors,
        private _workspace: Workspace,
    ) {
        super()

        this._store = createStore()
        this._actions = bindActionCreators(ActionCreators as any, this._store.dispatch)
        this._toolTipsProvider = new NeovimEditorToolTipsProvider(this._actions)

        this._contextMenuManager = new ContextMenuManager(this._toolTipsProvider, this._colors)

        this._neovimInstance = new NeovimInstance(100, 100, this._configuration)
        this._bufferManager = new BufferManager(this._neovimInstance, this._actions, this._store)
        this._screen = new NeovimScreen()

        this._screenWithPredictions = new ScreenWithPredictions(this._screen, this._configuration)

        this._hoverRenderer = new HoverRenderer(this, this._configuration, this._toolTipsProvider)

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

        const notificationManager = getNotificationsInstance()
        this._neovimInstance.onMessage.subscribe(messageInfo => {
            // TODO: Hook up real notifications
            const notification = notificationManager.createItem()
            notification.setLevel("error")
            notification.setContents(messageInfo.title, messageInfo.details)
            notification.onClick.subscribe(() =>
                commandManager.executeCommand("oni.config.openInitVim"),
            )
            notification.show()
        })

        const initVimPath = this._neovimInstance.doesInitVimExist()
        const initVimInUse = this._configuration.getValue("oni.loadInitVim")
        const hasCheckedInitVim = this._configuration.getValue("_internal.hasCheckedInitVim")

        if (initVimPath && !initVimInUse && !hasCheckedInitVim) {
            const initVimNotification = notificationManager.createItem()
            initVimNotification.setLevel("info")
            initVimNotification.setContents(
                "init.vim found",
                `We found an init.vim file would you like Oni to use it?
                This will result in Oni being reloaded`,
            )

            initVimNotification.setButtons([
                {
                    title: "Yes",
                    callback: () => {
                        this._configuration.setValues(
                            { "_internal.hasCheckedInitVim": true, "oni.loadInitVim": true },
                            true,
                        )
                        commandManager.executeCommand("oni.debug.reload")
                    },
                },
                {
                    title: "No",
                    callback: () => {
                        this._configuration.setValues(
                            { "oni.loadInitVim": false, "_internal.hasCheckedInitVim": true },
                            true,
                        )
                    },
                },
            ])
            initVimNotification.show()
        }

        this._renderer =
            this._configuration.getValue("editor.renderer") === "webgl"
                ? new WebGLRenderer()
                : new CanvasRenderer()

        this._rename = new Rename(
            this,
            this._languageManager,
            this._toolTipsProvider,
            this._workspace,
        )

        // Services
        const onColorsChanged = () => {
            const updatedColors = this._colors.getColors()
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

        this.trackDisposable(
            this._tokenColors.onTokenColorsChanged.subscribe(() => onTokenColorschanged()),
        )

        // Overlays
        // TODO: Replace `OverlayManagement` concept and associated window management code with
        // explicit window management: #362
        this._windowManager = new NeovimWindowManager(this._neovimInstance)
        this.trackDisposable(
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
            }),
        )

        this.trackDisposable(
            this._neovimInstance.onWildMenuShow.subscribe(wildMenuInfo => {
                this._actions.showWildMenu(wildMenuInfo)
            }),
        )

        this.trackDisposable(
            this._neovimInstance.onWildMenuSelect.subscribe(wildMenuInfo => {
                this._actions.wildMenuSelect(wildMenuInfo)
            }),
        )

        this.trackDisposable(
            this._neovimInstance.onWildMenuHide.subscribe(() => {
                this._actions.hideWildMenu()
            }),
        )

        this.trackDisposable(
            this._neovimInstance.onCommandLineHide.subscribe(() => {
                this._actions.hideCommandLine()
                this._externalMenuOverlay.hide()
            }),
        )

        this.trackDisposable(
            this._neovimInstance.onCommandLineSetCursorPosition.subscribe(commandLinePos => {
                this._actions.setCommandLinePosition(commandLinePos)
            }),
        )

        this.trackDisposable(
            this._windowManager.onWindowStateChanged.subscribe(tabPageState => {
                if (!tabPageState) {
                    return
                }
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
                        activeWindow.visibleLines,
                    )
                }

                filteredTabState.map(w => {
                    this._actions.setInactiveWindowState(w.windowNumber, w.dimensions)
                })
            }),
        )

        this.trackDisposable(
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
                        const content = yankInfo.regcontents.join(os.EOL)
                        const postfix = yankInfo.regtype === "V" ? os.EOL : ""
                        clipboard.writeText(content + postfix)
                    }
                }
            }),
        )

        this.trackDisposable(
            this._neovimInstance.onTitleChanged.subscribe(newTitle => {
                const title = newTitle.replace(" - NVIM", " - ONI")
                Shell.Actions.setWindowTitle(title)
            }),
        )

        this.trackDisposable(
            this._neovimInstance.onLeave.subscribe(() => {
                this._onNeovimQuit.dispatch()
            }),
        )

        this.trackDisposable(
            this._neovimInstance.onOniCommand.subscribe(context => {
                const commandToExecute = context.command
                const commandArgs = context.args

                commandManager.executeCommand(commandToExecute, commandArgs)
            }),
        )

        // TODO: Refactor to event and track disposable
        this.trackDisposable(
            this._neovimInstance.onVimEvent.subscribe(evt => {
                if (evt.eventName !== "VimLeave") {
                    this._updateWindow(evt.eventContext)
                    this._bufferManager.updateBufferFromEvent(evt.eventContext)
                }
            }),
        )

        this.trackDisposable(
            this._neovimInstance.autoCommands.onBufDelete.subscribe((evt: BufferEventContext) =>
                this._onBufDelete(evt),
            ),
        )

        this.trackDisposable(
            this._neovimInstance.autoCommands.onBufUnload.subscribe((evt: BufferEventContext) =>
                this._onBufUnload(evt),
            ),
        )

        this.trackDisposable(
            this._neovimInstance.autoCommands.onBufEnter.subscribe((evt: BufferEventContext) =>
                this._onBufEnter(evt),
            ),
        )

        this.trackDisposable(
            this._neovimInstance.autoCommands.onBufWinEnter.subscribe((evt: BufferEventContext) =>
                this._onBufEnter(evt),
            ),
        )

        this.trackDisposable(
            this._neovimInstance.autoCommands.onFileTypeChanged.subscribe((evt: EventContext) =>
                this._onFileTypeChanged(evt),
            ),
        )

        this.trackDisposable(
            this._neovimInstance.autoCommands.onBufWipeout.subscribe((evt: BufferEventContext) =>
                this._onBufWipeout(evt),
            ),
        )

        this.trackDisposable(
            this._neovimInstance.autoCommands.onBufWritePost.subscribe((evt: EventContext) =>
                this._onBufWritePost(evt),
            ),
        )

        this.trackDisposable(
            this._neovimInstance.onColorsChanged.subscribe(() => {
                this._onColorsChanged()
            }),
        )

        this.trackDisposable(
            this._neovimInstance.onError.subscribe(err => {
                this._errorInitializing = true
                this._actions.setNeovimError(true)
            }),
        )

        // These functions are mirrors of each other if vim changes dir then oni responds
        // and if oni initiates the dir change then we inform vim
        // NOTE: the gates to check that the dirs being passed aren't already set prevent
        // an infinite loop!!
        this.trackDisposable(
            this._neovimInstance.onDirectoryChanged.subscribe(async newDirectory => {
                if (newDirectory !== this._workspace.activeWorkspace) {
                    await this._workspace.changeDirectory(newDirectory)
                }
            }),
        )

        this.trackDisposable(
            this._workspace.onDirectoryChanged.subscribe(async newDirectory => {
                if (newDirectory !== this._neovimInstance.currentVimDirectory) {
                    await this._neovimInstance.chdir(newDirectory)
                }
            }),
        )

        // TODO: Add first class event for this
        this._neovimInstance.on("action", (action: any) => {
            this._renderer.onAction(action)
            this._screen.dispatch(action)

            this._scheduleRender()
        })

        this._typingPredictionManager.onPredictionsChanged.subscribe(predictions => {
            this._screenWithPredictions.updatePredictions(predictions, this._screen.cursorRow)
            this._renderImmediate()
        })

        this.trackDisposable(
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
            }),
        )

        // TODO: Add first class event for this
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

        // TODO: Does any disposal need to happen for the observables?
        this._cursorMoved$ = asObservable(this._neovimInstance.autoCommands.onCursorMoved).map(
            (evt): Oni.Cursor => ({
                line: evt.line - 1,
                column: evt.column - 1,
            }),
        )

        this._cursorMovedI$ = asObservable(this._neovimInstance.autoCommands.onCursorMovedI).map(
            (evt): Oni.Cursor => ({
                line: evt.line - 1,
                column: evt.column - 1,
            }),
        )

        Observable.merge(this._cursorMoved$, this._cursorMovedI$).subscribe(cursorMoved => {
            this.notifyCursorMoved(cursorMoved)
        })

        this._modeChanged$ = asObservable(this._neovimInstance.onModeChanged)
        this._onScroll$ = asObservable(this._neovimInstance.onScroll)

        this.trackDisposable(
            this._neovimInstance.onModeChanged.subscribe(newMode => this._onModeChanged(newMode)),
        )

        this.trackDisposable(
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
            }),
        )

        this.trackDisposable(
            this._neovimInstance.onScroll.subscribe((args: EventContext) => {
                const convertedArgs: Oni.EditorBufferScrolledEventArgs = {
                    bufferTotalLines: args.bufferTotalLines,
                    windowTopLine: args.windowTopLine,
                    windowBottomLine: args.windowBottomLine,
                }
                this.notifyBufferScrolled(convertedArgs)
            }),
        )

        addInsertModeLanguageFunctionality(
            this._cursorMovedI$,
            this._modeChanged$,
            this._onScroll$,
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
            this._syntaxHighlighter,
        )
        this._completionMenu = new CompletionMenu(this._contextMenuManager.create())

        this.trackDisposable(
            this._completion.onShowCompletionItems.subscribe(completions => {
                this._completionMenu.show(completions.filteredCompletions, completions.base)
            }),
        )

        this.trackDisposable(
            this._completion.onHideCompletionItems.subscribe(completions => {
                this._completionMenu.hide()
            }),
        )

        this.trackDisposable(
            this._completionMenu.onItemFocused.subscribe(item => {
                this._completion.resolveItem(item)
            }),
        )

        this.trackDisposable(
            this._completionMenu.onItemSelected.subscribe(item => {
                this._completion.commitItem(item)
            }),
        )

        this._languageIntegration = new LanguageEditorIntegration(
            this,
            this._configuration,
            this._languageManager,
        )

        this.trackDisposable(
            this._languageIntegration.onShowHover.subscribe(async hover => {
                const { cursorPixelX, cursorPixelY } = this._store.getState()
                await this._hoverRenderer.showQuickInfo(
                    cursorPixelX,
                    cursorPixelY,
                    hover.hover,
                    hover.errors,
                )
            }),
        )

        this.trackDisposable(
            this._languageIntegration.onHideHover.subscribe(() => {
                this._hoverRenderer.hideQuickInfo()
            }),
        )

        this.trackDisposable(
            this._languageIntegration.onShowDefinition.subscribe(definition => {
                this._actions.setDefinition(definition.token, definition.location)
            }),
        )

        this.trackDisposable(
            this._languageIntegration.onHideDefinition.subscribe(definition => {
                this._actions.hideDefinition()
            }),
        )

        this._commands = new NeovimEditorCommands(
            commandManager,
            this._contextMenuManager,
            this._definition,
            this._languageIntegration,
            this._neovimInstance,
            this._rename,
            this._symbols,
        )

        this._renderImmediate()

        this._onConfigChanged(this._configuration.getValues())
        this.trackDisposable(
            this._configuration.onConfigurationChanged.subscribe(
                (newValues: Partial<IConfigurationValues>) => this._onConfigChanged(newValues),
            ),
        )

        // TODO: Factor these out to a place that isn't dependent on a single editor instance
        ipcRenderer.on("open-files", (_evt: any, files: string[]) => {
            this.openFiles(files)
        })

        ipcRenderer.on("open-file", (_evt: any, path: string) => {
            this._neovimInstance.command(`:e! ${path}`)
        })
    }

    public async blockInput(
        inputFunction: (inputCallback: Oni.InputCallbackFunction) => Promise<void>,
    ): Promise<void> {
        return this._neovimInstance.blockInput(inputFunction)
    }

    public dispose(): void {
        super.dispose()

        if (this._neovimInstance) {
            this._neovimInstance.dispose()
            this._neovimInstance = null
        }

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

        if (this._externalMenuOverlay) {
            this._externalMenuOverlay.hide()
            this._externalMenuOverlay = null
        }

        if (this._popupMenu) {
            this._popupMenu.dispose()
            this._popupMenu = null
        }

        if (this._windowManager) {
            this._windowManager.dispose()
            this._windowManager = null
        }
    }

    public enter(): void {
        Log.info("[NeovimEditor::enter]")
        this._onEnterEvent.dispatch()
        this._actions.setHasFocus(true)
        this._commands.activate()

        this._neovimInstance.autoCommands.executeAutoCommand("FocusGained")
        this.checkAutoRead()

        if (this.activeBuffer) {
            this.notifyBufferEnter(this.activeBuffer)
        }
    }

    public checkAutoRead(): void {
        // If the user has autoread enabled, we should run ":checktime" on
        // focus, as this is needed to get the file to auto-update.
        // https://github.com/neovim/neovim/issues/1936
        if (
            this._neovimInstance.isInitialized &&
            this._configuration.getValue("vim.setting.autoread")
        ) {
            this._neovimInstance.command(":checktime")
        }
    }

    public leave(): void {
        Log.info("[NeovimEditor::leave]")
        this._actions.setHasFocus(false)
        this._commands.deactivate()
        this._neovimInstance.autoCommands.executeAutoCommand("FocusLost")
    }

    public async createWelcomeBuffer() {
        const buf = await this.openFile("WELCOME")
        await buf.setScratchBuffer()
        return buf
    }

    public async clearSelection(): Promise<void> {
        await this._neovimInstance.input("<esc>")
        await this._neovimInstance.input("a")
    }

    public async setSelection(range: types.Range): Promise<void> {
        await this._neovimInstance.input("<esc>")

        // Clear out any pending block selection
        // Without this, if there was a line-wise visual selection,
        // range selection would not work correctly.
        const atomicCallsVisualMode = [
            [
                "nvim_call_function",
                ["setpos", [".", [0, range.start.line + 1, range.start.character + 1]]],
            ],
            ["nvim_command", ["normal! v"]],
            [
                "nvim_call_function",
                ["setpos", [".", [0, range.end.line + 1, range.end.character + 1]]],
            ],
        ]
        await this._neovimInstance.request("nvim_call_atomic", [atomicCallsVisualMode])
        await this._neovimInstance.input("<esc>")

        // Re-select the selection and switch to 'select' mode so that typing
        // overwrites the selection
        const atomicCalls = [
            [
                "nvim_call_function",
                ["setpos", ["'<", [0, range.start.line + 1, range.start.character + 1]]],
            ],
            [
                "nvim_call_function",
                ["setpos", ["'>", [0, range.end.line + 1, range.end.character + 1]]],
            ],
            // ["nvim_command", ["normal! v"]],
            ["nvim_command", ["set selectmode=cmd"]],
            ["nvim_command", ["normal! gv"]],
            ["nvim_command", ["set selectmode="]],
        ]

        await this._neovimInstance.request("nvim_call_atomic", [atomicCalls])
    }

    public async setTextOptions(textOptions: Oni.EditorTextOptions): Promise<void> {
        const { insertSpacesForTab, tabSize } = textOptions
        if (insertSpacesForTab) {
            await this._neovimInstance.command("set expandtab")
        } else {
            await this._neovimInstance.command("set noexpandtab")
        }

        await this._neovimInstance.command(
            `set tabstop=${tabSize} shiftwidth=${tabSize} softtabstop=${tabSize}`,
        )
    }

    // "v:this_session" |this_session-variable| - is a variable nvim sets to the path of
    // the current session file when one is loaded we use it here to check the current session
    // if it in oni's session dir then this is updated
    public async getCurrentSession(): Promise<string | void> {
        const result = await this._neovimInstance.request<string | NeovimError>("nvim_get_vvar", [
            "this_session",
        ])

        if (Array.isArray(result)) {
            return this._handleNeovimError(result)
        }
        return result
    }

    public async persistSession(session: ISession) {
        const result = await this._neovimInstance.command(`mksession! ${session.file}`)
        return this._handleNeovimError(result)
    }

    public async restoreSession(session: ISession) {
        await this._neovimInstance.closeAllBuffers()
        const result = await this._neovimInstance.command(`source ${session.file}`)
        return this._handleNeovimError(result)
    }

    public async openFile(
        file: string,
        openOptions: Oni.FileOpenOptions = Oni.DefaultFileOpenOptions,
    ): Promise<Oni.Buffer> {
        const tabsMode = this._configuration.getValue("tabs.mode") === "tabs"
        const cmd = new Proxy(
            {
                [Oni.FileOpenMode.NewTab]: "tabnew!",
                [Oni.FileOpenMode.HorizontalSplit]: "sp!",
                [Oni.FileOpenMode.VerticalSplit]: "vsp!",
                [Oni.FileOpenMode.Edit]: tabsMode ? "tab drop" : "e!",
                [Oni.FileOpenMode.ExistingTab]: "e!",
            },
            {
                get: (target: { [cmd: string]: string }, name: string) =>
                    name in target ? target[name] : "e!",
            },
        )

        await this._neovimInstance.command(
            `:${cmd[openOptions.openMode]} ${this._escapeSpaces(file)}`,
        )
        return this.activeBuffer
    }

    public openFiles = async (
        files: string[],
        openOptions: Oni.FileOpenOptions = Oni.DefaultFileOpenOptions,
    ): Promise<Oni.Buffer> => {
        if (!files) {
            return this.activeBuffer
        }

        // Open the first file in the current buffer if there is no file there,
        // otherwise use the passed option.
        // Respects the users config and uses "tab drop" for Tab users, and "e!"
        // otherwise.
        if (this.activeBuffer.filePath === "") {
            await this.openFile(files[0], { openMode: Oni.FileOpenMode.Edit })
        } else {
            await this.openFile(files[0], openOptions)
        }

        for (let i = 1; i < files.length; i++) {
            await this.openFile(files[i], openOptions)
        }

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

    public _onFilesDropped = async (files: FileList) => {
        if (files.length) {
            const normalisedPaths = Array.from(files).map(f => normalizePath(f.path))
            await this.openFiles(normalisedPaths, { openMode: Oni.FileOpenMode.Edit })
        }
    }

    public async init(
        filesToOpen: string[],
        startOptions?: Partial<INeovimStartOptions>,
    ): Promise<void> {
        Log.info("[NeovimEditor::init] Called with filesToOpen: " + filesToOpen)
        const defaultOptions: INeovimStartOptions = {
            runtimePaths: this._pluginManager.getAllRuntimePaths(),
            transport: this._configuration.getValue("experimental.neovim.transport"),
            neovimPath: this._configuration.getValue("debug.neovimPath"),
            loadInitVim: this._configuration.getValue("oni.loadInitVim"),
            useDefaultConfig: this._configuration.getValue("oni.useDefaultConfig"),
        }

        const combinedOptions = {
            ...defaultOptions,
            ...startOptions,
        }

        await this._neovimInstance.start(combinedOptions)

        if (this._errorInitializing) {
            return
        }

        VimConfigurationSynchronizer.synchronizeConfiguration(
            this._neovimInstance,
            this._configuration.getValues(),
        )

        this._themeManager.onThemeChanged.subscribe(() => {
            const newTheme = this._themeManager.activeTheme

            if (
                newTheme.baseVimTheme &&
                (newTheme.baseVimTheme !== this._currentColorScheme ||
                    newTheme.baseVimBackground !== this._currentBackground)
            ) {
                this.setColorSchemeFromTheme(newTheme)
            }
        })

        if (this._themeManager.activeTheme && this._themeManager.activeTheme.baseVimTheme) {
            await this.setColorSchemeFromTheme(this._themeManager.activeTheme)
        }

        if (filesToOpen && filesToOpen.length > 0) {
            await this.openFiles(filesToOpen, { openMode: Oni.FileOpenMode.Edit })
        } else {
            if (this._configuration.getValue("experimental.welcome.enabled")) {
                this._onEmptyBuffer.dispatch()
            }
        }

        this._actions.setLoadingComplete()

        this._hasLoaded = true
        this._isFirstRender = true
        this._scheduleRender()
    }

    public async setColorSchemeFromTheme(theme: IThemeMetadata): Promise<void> {
        if (
            (theme.baseVimBackground === "dark" || theme.baseVimBackground === "light") &&
            theme.baseVimBackground !== this._currentBackground
        ) {
            await this._neovimInstance.command(":set background=" + theme.baseVimBackground)
            this._currentBackground = theme.baseVimBackground
        }

        await this._neovimInstance.command(":color " + theme.baseVimTheme)
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
                    onFileDrop={this._onFilesDropped}
                    renderer={this._renderer}
                    autoFocus={this._autoFocus}
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
        const buf = this.activeBuffer
        const layerInputHandler = buf && buf.handleInput(key)

        if (layerInputHandler) {
            return
        }

        await this._neovimInstance.input(key)
    }

    public async quit(): Promise<void> {
        if (this._windowManager) {
            this._windowManager.dispose()
            this._windowManager = null
        }

        return this._neovimInstance.quit()
    }

    private _onBounceStart(): void {
        this._actions.setCursorScale(1.1)
    }

    private _onBounceEnd(): void {
        this._actions.setCursorScale(1.0)
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

    private _onFileTypeChanged(evt: EventContext): void {
        const buf = this._bufferManager.updateBufferFromEvent(evt)
        this._bufferLayerManager.notifyBufferFileTypeChanged(buf)
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

    private _escapeSpaces(str: string): string {
        return str.split(" ").join("\\ ")
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
        const fontWeight = this._configuration.getValue("editor.fontWeight")
        const linePadding = this._configuration.getValue("editor.linePadding")

        this._actions.setFont(fontFamily, fontSize, fontWeight)
        this._neovimInstance.setFont(fontFamily, fontSize, fontWeight, linePadding)

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

        // In error cases, the neovim API layer returns an array
        if (typeof newColorScheme !== "string") {
            return
        }

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
        window.requestAnimationFrame(() => this._renderImmediate())
    }

    private _renderImmediate(): void {
        this._pendingAnimationFrame = false

        if (this._hasLoaded) {
            if (this._isFirstRender) {
                this._isFirstRender = false
                this._renderer.redrawAll(this._screenWithPredictions as any)
            } else {
                this._renderer.draw(this._screenWithPredictions as any)
            }
        }
    }

    private _handleNeovimError(result: NeovimError | void): void {
        if (!result) {
            return null
        }
        // the first value of the error response is a 0
        if (Array.isArray(result) && !result[0]) {
            const [, error] = result
            Log.warn(error)
            throw new Error(error)
        }
    }
}
