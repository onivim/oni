import * as path from "path"

import * as React from "react"

import { IncrementalDeltaRegionTracker } from "./../DeltaRegionTracker"
import { NeovimInstance } from "./../NeovimInstance"
import { NeovimScreen } from "./../Screen"
import { DOMRenderer } from "./../Renderer/DOMRenderer"

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
    show(): void
    render(element: HTMLElement): void
    hide(): void

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
        return <div ref={(elem) => this._element = elem} className="editor"></div>
    }
}

export class NeovimEditor implements IEditor {

    private _neovimInstance: NeovimInstance
    private _deltaRegionManager: IncrementalDeltaRegionTracker
    private _screen: NeovimScreen

    constructor(
        private _commandManager: CommandManager
        private _pluginManager: PluginManager
        private _renderer: DOMRenderer = new DOMRenderer()
    ) { 
        this._neovimInstance = new NeovimInstance(pluginManager, document.body.offsetWidth, document.body.offsetHeight)
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
    }


    public show(): void {

    }

    public hide(): void {

    }

    public render(element: HTMLElement): void {
        this._renderer.start(element)
    }
}
