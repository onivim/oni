/**
 * index.tsx
 *
 * Entry point for the BrowserWindow process
 */

import { ipcRenderer } from "electron"
import * as minimist from "minimist"
import * as Log from "./Log"
import * as Performance from "./Performance"

import { commandManager } from "./Services/CommandManager"
import { configuration, IConfigurationValues } from "./Services/Configuration"
import { editorManager } from "./Services/EditorManager"
import { inputManager } from "./Services/InputManager"

import * as SharedNeovimInstance from "./neovim/SharedNeovimInstance"

import { createLanguageClientsFromConfiguration } from "./Services/Language"

const start = async (args: string[]): Promise<void> => {
    Performance.startMeasure("Oni.Start")

    const UI = await import("./UI")
    UI.activate()

    const parsedArgs = minimist(args)

    const cssPromise = import("./CSS")
    const pluginManagerPromise = import("./Plugins/PluginManager")
    const autoClosingPairsPromise = import("./Services/AutoClosingPairs")
    const browserWindowConfigurationSynchronizerPromise = import("./Services/BrowserWindowConfigurationSynchronizer")
    const colorsPromise = import("./Services/Colors")
    const languageManagerPromise = import("./Services/Language")
    const themesPromise = import("./Services/Themes")
    const iconThemesPromise = import("./Services/IconThemes")

    // Helper for debugging:
    window["UI"] = UI // tslint:disable-line no-string-literal

    Performance.startMeasure("Oni.Start.Config")

    const initialConfigParsingError = configuration.getParsingError()
    if (initialConfigParsingError) {
        Log.error(initialConfigParsingError)
    }

    const configChange = (newConfigValues: Partial<IConfigurationValues>) => {
        let prop: keyof IConfigurationValues
        for (prop in newConfigValues) {
            UI.Actions.setConfigValue(prop, newConfigValues[prop])
        }
    }

    configuration.start()

    configChange(configuration.getValues()) // initialize values
    configuration.onConfigurationChanged.subscribe(configChange)
    Performance.endMeasure("Oni.Start.Config")

    const PluginManager = await pluginManagerPromise
    const pluginManager = PluginManager.pluginManager

    Performance.startMeasure("Oni.Start.Plugins.Discover")
    pluginManager.discoverPlugins()
    Performance.endMeasure("Oni.Start.Plugins.Discover")

    Performance.startMeasure("Oni.Start.Themes")
    const Themes = await themesPromise
    const IconThemes = await iconThemesPromise
    await Promise.all([
        Themes.activate(configuration),
        IconThemes.activate(configuration, pluginManager)
    ])

    const Colors = await colorsPromise
    Colors.activate(configuration, Themes.getThemeManagerInstance())
    UI.Actions.setColors(Themes.getThemeManagerInstance().getColors())
    Performance.endMeasure("Oni.Start.Themes")

    const BrowserWindowConfigurationSynchronizer = await browserWindowConfigurationSynchronizerPromise
    BrowserWindowConfigurationSynchronizer.activate(configuration, Colors.getInstance())

    Performance.startMeasure("Oni.Start.Editors")
    await Promise.all([
        SharedNeovimInstance.activate(),
        UI.startEditors(parsedArgs._, Colors.getInstance(), configuration)
    ])
    Performance.endMeasure("Oni.Start.Editors")

    const LanguageManager = await languageManagerPromise
    LanguageManager.activate()
    const languageManager = LanguageManager.getInstance()

    Performance.startMeasure("Oni.Start.Activate")
    const api = pluginManager.startApi()
    configuration.activate(api)

    createLanguageClientsFromConfiguration(configuration.getValues())

    const AutoClosingPairs = await autoClosingPairsPromise
    AutoClosingPairs.activate(configuration, editorManager, inputManager, languageManager)
    Performance.endMeasure("Oni.Start.Activate")

    const CSS = await cssPromise
    CSS.activate()

    UI.Actions.setLoadingComplete()

    checkForUpdates()

    Performance.endMeasure("Oni.Start")
}

ipcRenderer.on("init", (_evt: any, message: any) => {
    process.chdir(message.workingDirectory)
    start(message.args)
})

ipcRenderer.on("execute-command", (_evt: any, command: string) => {
    commandManager.executeCommand(command, null)
})

const checkForUpdates = async (): Promise<void> => {
    const AutoUpdate = await import("./Services/AutoUpdate")
    const { autoUpdater, constructFeedUrl } = AutoUpdate

    const feedUrl = await constructFeedUrl("https://api.onivim.io/v1/update")

    autoUpdater.onUpdateAvailable.subscribe(() => Log.info("Update available."))
    autoUpdater.onUpdateNotAvailable.subscribe(() => Log.info("Update not available."))

    autoUpdater.checkForUpdates(feedUrl)
}
