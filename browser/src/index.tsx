/**
 * index.tsx
 *
 * Entry point for the BrowserWindow process
 */

import { ipcRenderer } from "electron"
import * as minimist from "minimist"
import * as path from "path"
import * as Log from "./Log"
import * as Performance from "./Performance"
import * as Utility from "./Utility"

import { IConfigurationValues } from "./Services/Configuration/IConfigurationValues"

const start = async (args: string[]): Promise<void> => {
    Performance.startMeasure("Oni.Start")

    const UnhandledErrorMonitor = await import("./Services/UnhandledErrorMonitor")
    UnhandledErrorMonitor.activate()

    const Shell = await import("./UI/Shell")
    Shell.activate()

    const configurationPromise = import("./Services/Configuration")
    const pluginManagerPromise = import("./Plugins/PluginManager")
    const themesPromise = import("./Services/Themes")
    const iconThemesPromise = import("./Services/IconThemes")

    const sidebarPromise = import("./Services/Sidebar")
    const overlayPromise = import("./Services/Overlay")
    const statusBarPromise = import("./Services/StatusBar")
    const startEditorsPromise = import("./startEditors")

    const menuPromise = import("./Services/Menu")

    const sharedNeovimInstancePromise = import("./neovim/SharedNeovimInstance")
    const browserWindowConfigurationSynchronizerPromise = import("./Services/BrowserWindowConfigurationSynchronizer")
    const colorsPromise = import("./Services/Colors")
    const tokenColorsPromise = import("./Services/TokenColors")
    const diagnosticsPromise = import("./Services/Diagnostics")
    const editorManagerPromise = import("./Services/EditorManager")
    const globalCommandsPromise = import("./Services/Commands/GlobalCommands")
    const inputManagerPromise = import("./Services/InputManager")
    const languageManagerPromise = import("./Services/Language")
    const notificationsPromise = import("./Services/Notifications")
    const snippetPromise = import("./Services/Snippets")
    const taksPromise = import("./Services/Tasks")
    const workspacePromise = import("./Services/Workspace")

    const themePickerPromise = import("./Services/Themes/ThemePicker")
    const cssPromise = import("./CSS")
    const completionProvidersPromise = import("./Services/Completion/CompletionProviders")

    const parsedArgs = minimist(args)
    const currentWorkingDirectory = process.cwd()
    const filesToOpen = parsedArgs._.map(
        arg => (path.isAbsolute(arg) ? arg : path.join(currentWorkingDirectory, arg)),
    )

    // Helper for debugging:
    Performance.startMeasure("Oni.Start.Config")

    const { configuration } = await configurationPromise

    const initialConfigParsingErrors = configuration.getErrors()
    if (initialConfigParsingErrors && initialConfigParsingErrors.length > 0) {
        initialConfigParsingErrors.forEach((err: Error) => Log.error(err))
    }

    const configChange = (newConfigValues: Partial<IConfigurationValues>) => {
        let prop: keyof IConfigurationValues
        for (prop in newConfigValues) {
            Shell.Actions.setConfigValue(prop, newConfigValues[prop])
        }
    }

    configuration.onConfigurationError.subscribe(err => {
        // TODO: Better / nicer handling of error:
        alert(err)
    })

    configuration.start()

    configChange(configuration.getValues()) // initialize values
    configuration.onConfigurationChanged.subscribe(configChange)
    Performance.endMeasure("Oni.Start.Config")

    const PluginManager = await pluginManagerPromise
    PluginManager.activate(configuration)
    const pluginManager = PluginManager.getInstance()

    Performance.startMeasure("Oni.Start.Plugins.Discover")
    pluginManager.discoverPlugins()
    Performance.endMeasure("Oni.Start.Plugins.Discover")

    Performance.startMeasure("Oni.Start.Themes")
    const Themes = await themesPromise
    const IconThemes = await iconThemesPromise
    await Promise.all([
        Themes.activate(configuration, pluginManager),
        IconThemes.activate(configuration, pluginManager),
    ])

    const Colors = await colorsPromise
    Colors.activate(configuration, Themes.getThemeManagerInstance())
    Shell.initializeColors(Colors.getInstance())
    Performance.endMeasure("Oni.Start.Themes")

    const TokenColors = await tokenColorsPromise
    TokenColors.activate(configuration, Themes.getThemeManagerInstance())

    const BrowserWindowConfigurationSynchronizer = await browserWindowConfigurationSynchronizerPromise
    BrowserWindowConfigurationSynchronizer.activate(configuration, Colors.getInstance())

    const { editorManager } = await editorManagerPromise

    const Workspace = await workspacePromise
    Workspace.activate(configuration, editorManager)
    const workspace = Workspace.getInstance()

    const StatusBar = await statusBarPromise
    StatusBar.activate(configuration)
    const statusBar = StatusBar.getInstance()

    const Overlay = await overlayPromise
    Overlay.activate()
    const overlayManager = Overlay.getInstance()

    const sneakPromise = import("./Services/Sneak")
    const { commandManager } = await import("./Services/CommandManager")
    const Sneak = await sneakPromise
    Sneak.activate(commandManager, overlayManager)

    const Menu = await menuPromise
    Menu.activate(configuration, overlayManager)
    const menuManager = Menu.getInstance()

    const Notifications = await notificationsPromise
    Notifications.activate(configuration, overlayManager)

    UnhandledErrorMonitor.start(Notifications.getInstance())

    const Tasks = await taksPromise
    Tasks.activate(menuManager)
    const tasks = Tasks.getInstance()

    const LanguageManager = await languageManagerPromise
    LanguageManager.activate(configuration, editorManager, statusBar, workspace)
    const languageManager = LanguageManager.getInstance()

    Performance.startMeasure("Oni.Start.Editors")
    const SharedNeovimInstance = await sharedNeovimInstancePromise
    const { startEditors } = await startEditorsPromise

    const CSS = await cssPromise
    CSS.activate()

    Shell.Actions.setLoadingComplete()

    const Diagnostics = await diagnosticsPromise
    const diagnostics = Diagnostics.getInstance()

    const CompletionProviders = await completionProvidersPromise
    CompletionProviders.activate(languageManager)

    const initializeAllEditors = async () => {
        await startEditors(
            filesToOpen,
            Colors.getInstance(),
            CompletionProviders.getInstance(),
            configuration,
            diagnostics,
            languageManager,
            menuManager,
            overlayManager,
            pluginManager,
            tasks,
            Themes.getThemeManagerInstance(),
            TokenColors.getInstance(),
            workspace,
        )

        await SharedNeovimInstance.activate(configuration, pluginManager)
    }

    await Promise.race([Utility.delay(5000), initializeAllEditors()])
    Performance.endMeasure("Oni.Start.Editors")

    Performance.startMeasure("Oni.Start.Sidebar")
    const Sidebar = await sidebarPromise
    Sidebar.activate(configuration, workspace)
    const sidebarManager = Sidebar.getInstance()
    Performance.endMeasure("Oni.Start.Sidebar")

    const createLanguageClientsFromConfiguration =
        LanguageManager.createLanguageClientsFromConfiguration

    diagnostics.start(languageManager)

    const Browser = await import("./Services/Browser")
    Browser.activate(commandManager, configuration, editorManager)

    Performance.startMeasure("Oni.Start.Activate")
    const api = pluginManager.startApi()
    configuration.activate(api)

    createLanguageClientsFromConfiguration(configuration.getValues())

    const { inputManager } = await inputManagerPromise

    const autoClosingPairsPromise = import("./Services/AutoClosingPairs")

    const AutoClosingPairs = await autoClosingPairsPromise
    AutoClosingPairs.activate(configuration, editorManager, inputManager, languageManager)

    const GlobalCommands = await globalCommandsPromise
    GlobalCommands.activate(commandManager, menuManager, tasks)

    const Snippets = await snippetPromise
    Snippets.activate()

    const Search = await import("./Services/Search")
    Search.activate(commandManager, editorManager, Sidebar.getInstance(), workspace)

    const ThemePicker = await themePickerPromise
    ThemePicker.activate(configuration, menuManager, Themes.getThemeManagerInstance())

    const Bookmarks = await import("./Services/Bookmarks")
    Bookmarks.activate(configuration, editorManager, Sidebar.getInstance())

    const PluginsSidebarPane = await import("./Plugins/PluginSidebarPane")
    PluginsSidebarPane.activate(configuration, pluginManager, sidebarManager)

    Performance.endMeasure("Oni.Start.Activate")

    checkForUpdates()

    Performance.endMeasure("Oni.Start")
    ipcRenderer.send("Oni.started", "started")
}

ipcRenderer.on("init", (_evt: any, message: any) => {
    process.chdir(message.workingDirectory)
    start(message.args)
})

ipcRenderer.on("execute-command", async (_evt: any, command: string, arg?: any) => {
    const { commandManager } = await import("./Services/CommandManager")
    commandManager.executeCommand(command, arg)
})

const checkForUpdates = async (): Promise<void> => {
    const AutoUpdate = await import("./Services/AutoUpdate")
    const { autoUpdater, constructFeedUrl } = AutoUpdate

    const feedUrl = await constructFeedUrl("https://api.onivim.io/v1/update")

    autoUpdater.onUpdateAvailable.subscribe(() => Log.info("Update available."))
    autoUpdater.onUpdateNotAvailable.subscribe(() => Log.info("Update not available."))

    autoUpdater.checkForUpdates(feedUrl)
}
