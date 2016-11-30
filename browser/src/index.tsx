import * as React from "react"
import * as ReactDOM from "react-dom"

import { ipcRenderer } from "electron"

import { createStore, applyMiddleware } from "redux"
import { Provider } from "react-redux"

import { CanvasRenderer } from "./Renderer/CanvasRenderer"
import { CanvasActionRenderer } from "./Renderer/CanvasActionRenderer"

import { NeovimScreen, Screen } from "./Screen"
import { NeovimInstance } from "./NeovimInstance"
import { DeltaRegionTracker, IncrementalDeltaRegionTracker } from "./DeltaRegionTracker"
import { measureFont } from "./measureFont"
import { Cursor } from "./Cursor"
import { Keyboard } from "./Input/Keyboard"
import { Mouse } from "./Input/Mouse"
import { PluginManager } from "./Plugins/PluginManager"
import * as Config from "./Config"
import * as UI from "./UI/index"
import * as minimist from "minimist"

import { QuickOpen } from "./Services/QuickOpen"
import { Formatter } from "./Services/Formatter"
import { OutputWindow } from "./Services/Output"
import { LiveEvaluation } from "./Services/LiveEvaluation"
import { SyntaxHighlighter } from "./Services/SyntaxHighlighter"

import { OverlayManager } from "./UI/OverlayManager"
import { ErrorOverlay } from "./UI/Overlay/ErrorOverlay"
import { LiveEvaluationOverlay } from "./UI/Overlay/LiveEvaluationOverlay"

const start = (args: string[]) => {

    const parsedArgs = minimist(args)
    const debugPlugin = parsedArgs["debugPlugin"]

    // Helper for debugging:
    window["UI"] = UI

    require("./cursor.less")
    require("./overlay.less")

    var deltaRegion = new IncrementalDeltaRegionTracker()
    var screen = new NeovimScreen(deltaRegion)

    const pluginManager = new PluginManager(screen, debugPlugin);
    var instance = new NeovimInstance(pluginManager, document.body.offsetWidth, document.body.offsetHeight, parsedArgs._);

    const canvasElement = document.getElementById("test-canvas") as HTMLCanvasElement
    var renderer = new CanvasRenderer()
    renderer.start(canvasElement)

    var cursor = new Cursor()

    let pendingTimeout = null

    // Services
    const quickOpen = new QuickOpen(instance)
    const formatter = new Formatter(instance, pluginManager)
    const outputWindow = new OutputWindow(instance, pluginManager)
    const liveEvaluation = new LiveEvaluation(instance, pluginManager)
    const syntaxHighligher = new SyntaxHighlighter(instance, pluginManager)

    // Overlays
    const overlayManager = new OverlayManager(screen)
    const errorOverlay = new ErrorOverlay()
    const liveEvaluationOverlay = new LiveEvaluationOverlay()
    overlayManager.addOverlay("errors", errorOverlay)
    overlayManager.addOverlay("live-eval", liveEvaluationOverlay)


    pluginManager.on("signature-help-response", (signatureHelp: Oni.Plugin.SignatureHelpResult) => {
        UI.showSignatureHelp(signatureHelp)
    })

    pluginManager.on("set-errors", (key, fileName, errors, colors) => {
        errorOverlay.setErrors(key, fileName, errors, colors)
    })

    pluginManager.on("evaluate-block-result", (key) => {
        liveEvaluationOverlay.setLiveEvaluationResults([key])
    })

    instance.on("event", (eventName: string, evt) => {
        // TODO: Can we get rid of these?
        overlayManager.handleCursorMovedEvent(evt)
        errorOverlay.onVimEvent(eventName, evt)
    })

    instance.on("window-display-update", (arg) => {
        overlayManager.notifyWindowDimensionsChanged(arg)
    })

    instance.on("action", (action) => {
        renderer.onAction(action)
        screen.dispatch(action)
        cursor.dispatch(action)

        if (!pendingTimeout) {
            pendingTimeout = setTimeout(updateFunction, 0);
        }
    })

    instance.on("mode-change", (newMode: string) => {
        if (newMode === "normal") {
            UI.hideCompletions()
        } else if (newMode === "insert") {
            UI.hideQuickInfo()
        }
    })

    const updateFunction = () => {
        renderer.update(screen, deltaRegion);
        cursor.update(screen)
        deltaRegion.clearModifiedCells()

        // TODO: Move cursor to component
        UI.setCursorPosition(screen.cursorColumn * screen.fontWidthInPixels, screen.cursorRow * screen.fontHeightInPixels, screen.fontWidthInPixels, screen.fontHeightInPixels)

        UI.setBackgroundColor(screen.backgroundColor)

        clearTimeout(pendingTimeout)
        pendingTimeout = null
    }

    instance.setFont(Config.getValue<string>("editor.fontFamily"), Config.getValue<string>("editor.fontSize"));

    const mouse = new Mouse(canvasElement, screen)

    mouse.on("mouse", (mouseInput) => {
        instance.input(mouseInput)
    })

    const keyboard = new Keyboard()
    keyboard.on("keydown", key => {

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
                // Put a dummy character in front so it removes the word,
                // but not a '.' if the completion comes directly after
                instance.input("a<c-w>" + UI.getSelectedCompletion())

                UI.hideCompletions()
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
            pluginManager.executeCommand("editor.gotoDefinition")
        } else if (key === "<C-p>" && screen.mode === "normal") {
            quickOpen.show()
        } else {
            instance.input(key)
        }
    })

    UI.events.on("completion-item-selected", (item) => {
        pluginManager.notifyCompletionItemSelected(item)
    })

    const resize = () => {
        var width = document.body.offsetWidth;
        var height = document.body.offsetHeight;

        instance.resize(width, height)
        renderer.onResize()
    }
    window.addEventListener("resize", resize);

    window["neovim"] = instance

    UI.init()
}

ipcRenderer.on("init", (evt, message) => {
    start(message.args)
})

