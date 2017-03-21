import * as path from "path"

import * as React from "react"

import { IncrementalDeltaRegionTracker } from "./../DeltaRegionTracker"
import { NeovimInstance } from "./../NeovimInstance"
import { NeovimScreen } from "./../Screen"
import { DOMRenderer } from "./../Renderer/DOMRenderer"

import * as Config from "./../Config"

import { PluginManager } from "./../Plugins/PluginManager"

import { AutoCompletion } from "./../Services/AutoCompletion"
import { BufferUpdates } from "./../Services/BufferUpdates"
import { CommandManager } from "./../Services/CommandManager"
import { registerBuiltInCommands } from "./../Services/Commands"
import { Errors } from "./../Services/Errors"
import { Formatter } from "./../Services/Formatter"
import { LiveEvaluation } from "./../Services/LiveEvaluation"
import { MultiProcess } from "./../Services/MultiProcess"
import { OutputWindow } from "./../Services/Output"
import { QuickOpen } from "./../Services/QuickOpen"
import { SyntaxHighlighter } from "./../Services/SyntaxHighlighter"
import { Tasks } from "./../Services/Tasks"
import { WindowTitle } from "./../Services/WindowTitle"

import { ErrorOverlay } from "./../UI/Overlay/ErrorOverlay"
import { LiveEvaluationOverlay } from "./../UI/Overlay/LiveEvaluationOverlay"
import { OverlayManager } from "./../UI/Overlay/OverlayManager"
import { ScrollBarOverlay } from "./../UI/Overlay/ScrollBarOverlay"
import { Rectangle } from "./../UI/Types"

import * as UI from "./../UI/index"

export interface IEditor {
    render(element: HTMLDivElement): void
}

export interface IEditorHostProps {
    editor: IEditor
}

export class EditorHost extends React.Component<IEditorHostProps, void> {
    private _element: HTMLElement

    public componentWillMount(): void {
        this.props.editor.show()
    }

    public componentDidMount(): void {
        if (this._element) {
            this.props.editor.render(this._element)
        }
    }

    public componentWillUnmount(): void {
        this.props.editor.hide()
    }

    public render(): JSX.Element {
        return <div ref={ (elem) => this._element = elem } className = "editor" > </div>
    }
}

export class NeovimEditor implements IEditor {

    private _neovimInstance: NeovimInstance
    private _deltaRegionManager: IncrementalDeltaRegionTracker
    private _screen: NeovimScreen

    private _pendingTimeout: NodeJS.Timer | null = null

    constructor(
        private _commandManager: CommandManager
        private _pluginManager: PluginManager
        private _renderer: DOMRenderer = new DOMRenderer()
    ) {
        let cursorLine: boolean
        let cursorColumn: boolean

        this._neovimInstance = new NeovimInstance(this._pluginManager, document.body.offsetWidth, document.body.offsetHeight)
        this._deltaRegionManager = new IncrementalDeltaRegionTracker()
        this._screen = new NeovimScreen(this._deltaRegionManager)

        const services: any[] = []

        const autoCompletion = new AutoCompletion(this._neovimInstance)
        const bufferUpdates = new BufferUpdates(this._neovimInstance, this._pluginManager)
        const errorService = new Errors(this._neovimInstance)
        const quickOpen = new QuickOpen(this._neovimInstance)
        const windowTitle = new WindowTitle(this._neovimInstance)
        const multiProcess = new MultiProcess()
        const formatter = new Formatter(this._neovimInstance, this._pluginManager, bufferUpdates)
        const outputWindow = new OutputWindow(this._neovimInstance, this._pluginManager)
        const liveEvaluation = new LiveEvaluation(this._neovimInstance, this._pluginManager)
        const syntaxHighlighter = new SyntaxHighlighter(this._neovimInstance, this._pluginManager)
        const tasks = new Tasks(outputWindow)
        registerBuiltInCommands(this._commandManager, this._pluginManager, this._neovimInstance)

        tasks.registerTaskProvider(this._commandManager)
        tasks.registerTaskProvider(errorService)

        services.push(autoCompletion)
        services.push(bufferUpdates)
        services.push(errorService)
        services.push(quickOpen)
        services.push(windowTitle)
        services.push(tasks)
        services.push(formatter)
        services.push(liveEvaluation)
        services.push(multiProcess)
        services.push(syntaxHighlighter)
        services.push(outputWindow)

        // Overlays
        const overlayManager = new OverlayManager(this._screen, this._neovimInstance)
        const errorOverlay = new ErrorOverlay()
        const liveEvaluationOverlay = new LiveEvaluationOverlay()
        const scrollbarOverlay = new ScrollBarOverlay()
        overlayManager.addOverlay("errors", errorOverlay)
        overlayManager.addOverlay("live-eval", liveEvaluationOverlay)
        overlayManager.addOverlay("scrollbar", scrollbarOverlay)

        overlayManager.on("current-window-size-changed", (dimensionsInPixels: Rectangle) => UI.setActiveWindowDimensionsChanged(dimensionsInPixels))

        this._pluginManager.on("signature-help-response", (err: string, signatureHelp: any) => { // FIXME: setup Oni import
            if (err) {
                UI.hideSignatureHelp()
            } else {
                UI.showSignatureHelp(signatureHelp)
            }
        })

        this._pluginManager.on("set-errors", (key: string, fileName: string, errors: any[], color: string) => {
            errorService.setErrors(fileName, errors)

            color = color || "red"
            errorOverlay.setErrors(key, fileName, errors, color)

            const errorMarkers = errors.map((e: any) => ({
                line: e.lineNumber,
                height: 1,
                color,
            }))
            scrollbarOverlay.setMarkers(path.resolve(fileName), key, errorMarkers)
        })

        liveEvaluation.on("evaluate-block-result", (file: string, blocks: any[]) => {
            liveEvaluationOverlay.setLiveEvaluationResult(file, blocks)
        })

        this._pluginManager.on("find-all-references", (references: Oni.Plugin.ReferencesResult) => {
            const convertToQuickFixItem = (item: Oni.Plugin.ReferencesResultItem) => ({
                filename: item.fullPath,
                lnum: item.line,
                col: item.column,
                text: item.lineText,
            })

            const quickFixItems = references.items.map((item) => convertToQuickFixItem(item))

            this._neovimInstance.quickFix.setqflist(quickFixItems, ` Find All References: ${references.tokenName}`)
            this._neovimInstance.command("copen")
            this._neovimInstance.command(`execute "normal! /${references.tokenName}\\<cr>"`)
        })

        this._neovimInstance.on("event", (eventName: string, evt: any) => {
            // TODO: Can we get rid of these?
            errorOverlay.onVimEvent(eventName, evt)
            liveEvaluationOverlay.onVimEvent(eventName, evt)
            scrollbarOverlay.onVimEvent(eventName, evt)

            tasks.onEvent(evt)

            if (eventName === "BufEnter") {
                // TODO: More convenient way to hide all UI?
                UI.hideCompletions()
                UI.hidePopupMenu()
                UI.hideSignatureHelp()
                UI.hideQuickInfo()
            }

            if (eventName === "DirChanged") {
                this._neovimInstance.getCurrentWorkingDirectory()
                    .then((newDirectory) => process.chdir(newDirectory))
            }
        })

        this._neovimInstance.on("error", (_err: string) => {
            UI.showNeovimInstallHelp()
        })

        this._neovimInstance.on("buffer-update", (context: any, lines: string[]) => {
            scrollbarOverlay.onBufferUpdate(context, lines)
        })

        this._neovimInstance.on("window-display-update", (eventContext: Oni.EventContext, lineMapping: any) => {
            overlayManager.notifyWindowDimensionsChanged(eventContext, lineMapping)
        })

        this._neovimInstance.on("action", (action: any) => {
            this._renderer.onAction(action)
            this._screen.dispatch(action)

            UI.setColors(this._screen.foregroundColor)

            if (!this._pendingTimeout) {
                this._pendingTimeout = setTimeout(() => this._onUpdate(), 0)
            }
        })

        this._neovimInstance.on("mode-change", (newMode: string) => {
            UI.setMode(newMode)

            if (newMode === "normal") {
                if (cursorLine) { // TODO: Add "unhide" i.e. only show if previously visible
                    UI.showCursorLine()
                }
                if (cursorColumn) {
                    UI.showCursorColumn()
                }
                UI.hideCompletions()
                UI.hideSignatureHelp()
            } else if (newMode === "insert") {
                UI.hideQuickInfo()
                if (cursorLine) { // TODO: Add "unhide" i.e. only show if previously visible
                    UI.showCursorLine()
                }
                if (cursorColumn) {
                    UI.showCursorColumn()
                }
            } else if (newMode === "cmdline") {
                UI.hideCursorColumn() // TODO: cleaner way to hide and unhide?
                UI.hideCursorLine()
                UI.hideCompletions()
                UI.hideQuickInfo()

            }
        })

        const renderFunction = () => {
            if (this._pendingTimeout) {
                UI.setCursorPosition(this._screen)
            }

            this._renderer.update(this._screen, this._deltaRegionManager)

            this._deltaRegionManager.cleanUpRenderedCells()

            window.requestAnimationFrame(() => renderFunction())
        }

        renderFunction()

        const config = Config.instance()

        const configChange = () => {
            cursorLine = config.getValue<boolean>("editor.cursorLine")
            cursorColumn = config.getValue<boolean>("editor.cursorColumn")
            UI.setCursorLineOpacity(config.getValue<number>("editor.cursorLineOpacity"))
            UI.setCursorColumnOpacity(config.getValue<number>("editor.cursorColumnOpacity"))

            if (cursorLine) {
                UI.showCursorLine()
            }

            if (cursorColumn) {
                UI.showCursorColumn()
            }

            this._neovimInstance.setFont(config.getValue<string>("editor.fontFamily"), config.getValue<string>("editor.fontSize"))
            this._onUpdate()
        }
        configChange() // initialize values
        config.registerListener(configChange)

        const keyboard = new Keyboard()
        keyboard.on("keydown", (key: string) => {

            if (key === "<f3>") {
                formatter.formatBuffer()
                return
            }

            if (UI.isPopupMenuOpen()) {
                if (key === "<esc>") {
                    UI.hidePopupMenu()
                } else if (key === "<enter>") {
                    UI.selectPopupMenuItem(false)
                } else if (key === "<C-v>") {
                    UI.selectPopupMenuItem(true)
                } else if (key === "<C-n>") {
                    UI.nextPopupMenuItem()
                } else if (key === "<C-p>") {
                    UI.previousPopupMenuItem()
                }

                return
            }

            if (UI.areCompletionsVisible()) {

                if (key === "<enter>") {
                    autoCompletion.complete()
                    return
                } else if (key === "<C-n>") {
                    UI.nextCompletion()
                    return

                } else if (key === "<C-p>") {
                    UI.previousCompletion()
                    return
                }
            }

            if (key === "<f12>") {
                commandManager.executeCommand("oni.editor.gotoDefinition", null)
            } else if (key === "<C-p>" && screen.mode === "normal") {
                quickOpen.show()
            } else if (key === "<C-P>" && screen.mode === "normal") {
                tasks.show()
            } else if (key === "<C-pageup>") {
                multiProcess.focusPreviousInstance()
            } else if (key === "<C-pagedown>") {
                multiProcess.focusNextInstance()
            } else {
                instance.input(key)
            }
        })

        window["__neovim"] = this._neovimInstance // tslint:disable-line no-string-literal
        window["__screen"] = this._screen // tslint:disable-line no-string-literal

        // TODO: Listen to element instead
        window.addEventListener("resize", () => this._onResize())

    }

    private _onResize(): void {
        let width = document.body.offsetWidth
        let height = document.body.offsetHeight

        this._deltaRegionManager.dirtyAllCells()

        this._neovimInstance.resize(width, height)
        this._renderer.onResize()
    }

    private _onUpdate(): void {

        UI.setCursorPosition(this._screen)

        UI.setBackgroundColor(this._screen.backgroundColor)

        if (!!this._pendingTimeout) {
            clearTimeout(this._pendingTimeout)
            this._pendingTimeout = null
        }
    }

    public render(element: HTMLDivElement): void {
        this._renderer.start(element)

        const mouse = new Mouse(element, screen)

        mouse.on("mouse", (mouseInput: string) => {
            UI.hideCompletions()
            this._neovimInstance.input(mouseInput)
        })
    }
}
