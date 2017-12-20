/**
 * index.tsx
 *
 * Entry point for the BrowserWindow process
 */

import { ipcRenderer } from "electron"
import * as minimist from "minimist"
import * as Log from "./Log"
import * as Performance from "./Performance"

import { IConfigurationValues } from "./Services/Configuration/IConfigurationValues"

const start = async (args: string[]): Promise<void> => {
    Performance.startMeasure("Oni.Start")

    const UI = await import("./UI")
    UI.activate()

    const parsedArgs = minimist(args)

    const configurationPromise = import("./Services/Configuration")
    const pluginManagerPromise = import("./Plugins/PluginManager")
    const themesPromise = import("./Services/Themes")
    const iconThemesPromise = import("./Services/IconThemes")

    const startEditorsPromise = import("./startEditors")

    const sharedNeovimInstancePromise = import("./neovim/SharedNeovimInstance")
    const autoClosingPairsPromise = import("./Services/AutoClosingPairs")
    const browserWindowConfigurationSynchronizerPromise = import("./Services/BrowserWindowConfigurationSynchronizer")
    const colorsPromise = import("./Services/Colors")
    const diagnosticsPromise = import("./Services/Diagnostics")
    const editorManagerPromise = import("./Services/EditorManager")
    const inputManagerPromise = import("./Services/InputManager")
    const languageManagerPromise = import("./Services/Language")
    const cssPromise = import("./CSS")

    // Helper for debugging:
    window["UI"] = UI // tslint:disable-line no-string-literal

    Performance.startMeasure("Oni.Start.Config")

    const { configuration } = await configurationPromise

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

    const { pluginManager } = await pluginManagerPromise

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

    const { editorManager } = await editorManagerPromise

    const LanguageManager = await languageManagerPromise
    LanguageManager.activate(configuration, editorManager)
    const languageManager = LanguageManager.getInstance()

    Performance.startMeasure("Oni.Start.Editors")
    const SharedNeovimInstance = await sharedNeovimInstancePromise
    const { startEditors } = await startEditorsPromise
    await Promise.all([
        SharedNeovimInstance.activate(),
        startEditors(parsedArgs._, Colors.getInstance(), configuration, languageManager, Themes.getThemeManagerInstance())
    ])
    Performance.endMeasure("Oni.Start.Editors")

    const createLanguageClientsFromConfiguration = LanguageManager.createLanguageClientsFromConfiguration

    const Diagnostics = await diagnosticsPromise
    Diagnostics.activate(languageManager)

    Performance.startMeasure("Oni.Start.Activate")
    const api = pluginManager.startApi()
    configuration.activate(api)

    createLanguageClientsFromConfiguration(configuration.getValues())

    const { inputManager } = await inputManagerPromise

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

ipcRenderer.on("execute-command", async (_evt: any, command: string) => {
    const { commandManager } = await import("./Services/CommandManager")
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
