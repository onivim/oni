import * as React from "react";
import * as ReactDOM from "react-dom";

import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";

import { CanvasRenderer } from "./Renderer"
import { NeovimScreen, Screen } from "./Screen"
import { NeovimInstance } from "./NeovimInstance"
import { DeltaRegionTracker, IncrementalDeltaRegionTracker } from "./DeltaRegionTracker"

import { Cursor } from "./Cursor"
import { Keyboard } from "./Keyboard"
import { PluginManager } from "./Plugins/PluginManager"
import * as Config from "./Config"
import * as UI from "./UI/index"

import { QuickOpen } from "./Services/QuickOpen"

// Helper for debugging:
window["UI"] = UI

require("./cursor.less")
require("./overlay.less")

var deltaRegion = new IncrementalDeltaRegionTracker()
var screen = new NeovimScreen(deltaRegion)

const pluginManager = new PluginManager(screen);
var instance = new NeovimInstance(pluginManager, document.body.offsetWidth, document.body.offsetHeight);

var renderer = new CanvasRenderer()
renderer.start(document.getElementById("test-canvas") as HTMLCanvasElement)

var cursor = new Cursor()

let pendingTimeout = null

const quickOpen = new QuickOpen(instance)

instance.on("action", (action) => {
    screen.dispatch(action)
    cursor.dispatch(action)

    if(!pendingTimeout) {
        pendingTimeout = setTimeout(updateFunction, 0);
    }
})

instance.on("mode-change", (newMode: string) => {
    if(newMode === "normal") {
        UI.hideCompletions()
    } else if(newMode === "insert") {
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

const keyboard = new Keyboard()
keyboard.on("keydown", key => {


    if (UI.isPopupMenuOpen()) {
        if(key === "<esc>") {
            UI.hidePopupMenu()
        } else if(key === "<enter>") {
            UI.selectPopupMenuItem()
        } else if(key === "<C-n>") {
            UI.nextPopupMenuItem()
        } else if(key === "<C-p>") {
            UI.previousPopupMenuItem()
        }

        return
    }

    if (UI.areCompletionsVisible()) {

        if(key === "<enter>") {
            // Put a dummy character in front so it removes the word,
            // but not a '.' if the completion comes directly after
            instance.input("a<c-w>" + UI.getSelectedCompletion())

            UI.hideCompletions()
            return
        } else if(key === "<C-n>") {
            UI.nextCompletion()
            return

        } else if(key=== "<C-p>") {
            UI.previousCompletion()
            return
        }
    }


    if(key === "<f12>") {
        pluginManager.executeCommand("editor.gotoDefinition")
    } else if(key === "<C-p>") {
        quickOpen.show()
    } else {
        instance.input(key)
    }
})

UI.events.on("completion-item-selected", (item) => {
    pluginManager.notifyCompletionItemSelected(item)
})

import { measureFont } from "./measureFont";
const resize = () => {
    var width = document.body.offsetWidth;
    var height = document.body.offsetHeight;

    instance.resize(width, height)
    renderer.onResize()
}
window.addEventListener("resize", resize);

window["neovim"] = instance

UI.init()
