/**
 * App.ts
 *
 * Entry point for the Oni application - managing the overall lifecycle
 */

import { ipcRenderer, remote } from "electron"
import * as fs from "fs"
import * as minimist from "minimist"
import * as path from "path"

import { IDisposable } from "oni-types"

import * as Log from "oni-core-logging"
import * as Performance from "./Performance"
import * as Utility from "./Utility"

import { IConfigurationValues } from "./Services/Configuration/IConfigurationValues"

const editorManagerPromise = import("./Services/EditorManager")
const sharedNeovimInstancePromise = import("./neovim/SharedNeovimInstance")

export type QuitHook = () => Promise<void>

let _quitHooks: QuitHook[] = []
const _initializePromise: Utility.ICompletablePromise<void> = Utility.createCompletablePromise<
    void
>()

export const registerQuitHook = (quitHook: QuitHook): IDisposable => {
    _quitHooks.push(quitHook)

    const dispose = () => {
        _quitHooks = _quitHooks.filter(qh => qh !== quitHook)
    }

    return {
        dispose,
    }
}

export const quit = async (): Promise<void> => {
    Log.info(`[App::quit] called with ${_quitHooks.length} quitHooks`)
    const promises = _quitHooks.map(async qh => {
        Log.info("[App.quit] Waiting for quit hook...")
        await qh()
        Log.info("[App.quit] Quit hook completed successfully")
    })
    await Promise.all([promises])
    // On mac we should quit the application when the user press Cmd + Q
    if (process.platform === "darwin") {
        Log.info("[App::quit] quitting app")
        remote.app.quit()
    }
    Log.info("[App::quit] completed")
}

export const waitForStart = (): Promise<void> => {
    return _initializePromise.promise
}

export const start = async (args: string[]): Promise<void> => {
    Performance.startMeasure("Oni.Start")

    const UnhandledErrorMonitor = await import("./Services/UnhandledErrorMonitor")
    UnhandledErrorMonitor.activate()

    const Shell = await import("./UI/Shell")
    Shell.activate()

    const configurationPromise = import("./Services/Configuration")
    const configurationCommandsPromise = import("./Services/Configuration/ConfigurationCommands")
    const debugPromise = import("./Services/Debug")
    const pluginManagerPromise = import("./Plugins/PluginManager")
    const themesPromise = import("./Services/Themes")
    const iconThemesPromise = import("./Services/IconThemes")

    const sidebarPromise = import("./Services/Sidebar")
    const overlayPromise = import("./Services/Overlay")
    const statusBarPromise = import("./Services/StatusBar")
    const startEditorsPromise = import("./startEditors")

    const menuPromise = import("./Services/Menu")

    const browserWindowConfigurationSynchronizerPromise = import("./Services/BrowserWindowConfigurationSynchronizer")
    const colorsPromise = import("./Services/Colors")
    const tokenColorsPromise = import("./Services/TokenColors")
    const diagnosticsPromise = import("./Services/Diagnostics")
    const globalCommandsPromise = import("./Services/Commands/GlobalCommands")
    const inputManagerPromise = import("./Services/InputManager")
    const languageManagerPromise = import("./Services/Language")
    const vcsManagerPromise = import("./Services/VersionControl")
    const notificationsPromise = import("./Services/Notifications")
    const snippetPromise = import("./Services/Snippets")
    const keyDisplayerPromise = import("./Services/KeyDisplayer")
    const taksPromise = import("./Services/Tasks")
    const terminalPromise = import("./Services/Terminal")
    const workspacePromise = import("./Services/Workspace")
    const workspaceCommandsPromise = import("./Services/Workspace/WorkspaceCommands")
    const windowManagerPromise = import("./Services/WindowManager")
    const multiProcessPromise = import("./Services/MultiProcess")

    const themePickerPromise = import("./Services/Themes/ThemePicker")
    const cssPromise = import("./CSS")
    const completionProvidersPromise = import("./Services/Completion/CompletionProviders")

    const parsedArgs = minimist(args)
    const currentWorkingDirectory = process.cwd()
    const normalizedFiles = parsedArgs._.map(
        arg => (path.isAbsolute(arg) ? arg : path.join(currentWorkingDirectory, arg)),
    )

    const filesToOpen = normalizedFiles.filter(f => fs.existsSync(f) && fs.statSync(f).isFile())
    const foldersToOpen = normalizedFiles.filter(
        f => fs.existsSync(f) && fs.statSync(f).isDirectory(),
    )

    Log.info("Files to open: " + JSON.stringify(filesToOpen))
    Log.info("Folders to open: " + JSON.stringify(foldersToOpen))

    let workspaceToLoad = null

    // If a folder has been specified, we'll change directory to it
    if (foldersToOpen.length > 0) {
        workspaceToLoad = foldersToOpen[0]
    } else if (filesToOpen.length > 0) {
        workspaceToLoad = path.dirname(filesToOpen[0])
    }

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
            if (newConfigValues[prop]) {
                Shell.Actions.setConfigValue(prop, newConfigValues[prop])
            }
        }
    }

    configuration.start()

    configChange(configuration.getValues()) // initialize values
    configuration.onConfigurationChanged.subscribe(configChange)
    Performance.endMeasure("Oni.Start.Config")

    const PluginManager = await pluginManagerPromise
    PluginManager.activate(configuration)
    const pluginManager = PluginManager.getInstance()

    const developmentPlugin = parsedArgs["plugin-develop"]
    let developmentPluginError: { title: string; errorText: string }

    if (typeof developmentPlugin === "string") {
        Log.info("Registering development plugin: " + developmentPlugin)
        if (fs.existsSync(developmentPlugin)) {
            pluginManager.addDevelopmentPlugin(developmentPlugin)
        } else {
            developmentPluginError = {
                title: "Error parsing arguments",
                errorText: "Could not find plugin: " + developmentPlugin,
            }
            Log.warn(developmentPluginError.errorText)
        }
    } else if (typeof developmentPlugin === "boolean") {
        developmentPluginError = {
            title: "Error parsing arguments",
            errorText: "--plugin-develop must be followed by a plugin path",
        }
        Log.warn(developmentPluginError.errorText)
    }

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
    const colors = Colors.getInstance()
    Shell.initializeColors(Colors.getInstance())
    Performance.endMeasure("Oni.Start.Themes")

    const TokenColors = await tokenColorsPromise
    TokenColors.activate(configuration, Themes.getThemeManagerInstance())

    const BrowserWindowConfigurationSynchronizer = await browserWindowConfigurationSynchronizerPromise
    BrowserWindowConfigurationSynchronizer.activate(configuration, Colors.getInstance())

    const { editorManager } = await editorManagerPromise

    const Workspace = await workspacePromise
    Workspace.activate(configuration, editorManager, workspaceToLoad)
    const workspace = Workspace.getInstance()

    const WindowManager = await windowManagerPromise
    const MultiProcess = await multiProcessPromise

    MultiProcess.activate(WindowManager.windowManager)

    const StatusBar = await statusBarPromise
    StatusBar.activate(configuration)
    const statusBar = StatusBar.getInstance()

    const Overlay = await overlayPromise
    Overlay.activate()
    const overlayManager = Overlay.getInstance()

    const sneakPromise = import("./Services/Sneak")
    const { commandManager } = await import("./Services/CommandManager")
    const Sneak = await sneakPromise
    Sneak.activate(colors, commandManager, configuration, overlayManager)

    const Menu = await menuPromise
    Menu.activate(configuration, overlayManager)
    const menuManager = Menu.getInstance()

    const Notifications = await notificationsPromise
    Notifications.activate(configuration, overlayManager)
    const notifications = Notifications.getInstance()

    if (typeof developmentPluginError !== "undefined") {
        const notification = notifications.createItem()
        notification.setContents(developmentPluginError.title, developmentPluginError.errorText)
        notification.setLevel("error")
        notification.onClick.subscribe(() =>
            commandManager.executeCommand("oni.config.openConfigJs"),
        )
        notification.show()
    }

    configuration.onConfigurationError.subscribe(err => {
        const notification = notifications.createItem()
        notification.setContents("Error Loading Configuration", err.toString())
        notification.setLevel("error")
        notification.onClick.subscribe(() =>
            commandManager.executeCommand("oni.config.openConfigJs"),
        )
        notification.show()
    })

    UnhandledErrorMonitor.start(configuration, Notifications.getInstance())

    const Tasks = await taksPromise
    Tasks.activate(menuManager)
    const tasks = Tasks.getInstance()

    const LanguageManager = await languageManagerPromise
    LanguageManager.activate(configuration, editorManager, pluginManager, statusBar, workspace)
    const languageManager = LanguageManager.getInstance()

    Performance.startMeasure("Oni.Start.Editors")
    const SharedNeovimInstance = await sharedNeovimInstancePromise
    const { startEditors } = await startEditorsPromise

    const CSS = await cssPromise
    CSS.activate()

    const Snippets = await snippetPromise
    Snippets.activate(commandManager, configuration)

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
            Snippets.getInstance(),
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
    const Learning = await import("./Services/Learning")
    const Explorer = await import("./Services/Explorer")
    const Search = await import("./Services/Search")

    Sidebar.activate(configuration, workspace)
    const sidebarManager = Sidebar.getInstance()

    const VCSManager = await vcsManagerPromise
    VCSManager.activate(
        workspace,
        editorManager,
        statusBar,
        commandManager,
        menuManager,
        sidebarManager,
        notifications,
        configuration,
    )

    Explorer.activate(
        commandManager,
        configuration,
        editorManager,
        Sidebar.getInstance(),
        workspace,
    )
    Learning.activate(
        commandManager,
        configuration,
        editorManager,
        overlayManager,
        Sidebar.getInstance(),
        WindowManager.windowManager,
    )
    Performance.endMeasure("Oni.Start.Sidebar")

    const createLanguageClientsFromConfiguration =
        LanguageManager.createLanguageClientsFromConfiguration

    diagnostics.start(languageManager)

    const Browser = await import("./Services/Browser")
    Browser.activate(commandManager, configuration, editorManager)

    Performance.startMeasure("Oni.Start.Activate")
    const api = pluginManager.startApi()
    Search.activate(api)
    configuration.activate(api)

    Snippets.activateProviders(
        commandManager,
        CompletionProviders.getInstance(),
        configuration,
        pluginManager,
    )

    createLanguageClientsFromConfiguration(configuration.getValues())

    const { inputManager } = await inputManagerPromise

    const autoClosingPairsPromise = import("./Services/AutoClosingPairs")
    const indentationPromise = import("./Services/Indentation")

    const ConfigurationCommands = await configurationCommandsPromise
    ConfigurationCommands.activate(commandManager, configuration, editorManager)

    const AutoClosingPairs = await autoClosingPairsPromise
    AutoClosingPairs.activate(configuration, editorManager, inputManager, languageManager)

    const Indentation = await indentationPromise
    Indentation.activate(configuration, editorManager)

    const GlobalCommands = await globalCommandsPromise
    GlobalCommands.activate(commandManager, editorManager, menuManager, tasks)

    const Debug = await debugPromise
    Debug.activate(commandManager)

    const WorkspaceCommands = await workspaceCommandsPromise
    WorkspaceCommands.activateCommands(
        configuration,
        editorManager,
        Snippets.getInstance(),
        workspace,
    )

    const Preview = await import("./Services/Preview")
    Preview.activate(commandManager, configuration, editorManager)

    const KeyDisplayer = await keyDisplayerPromise
    KeyDisplayer.activate(
        commandManager,
        configuration,
        editorManager,
        inputManager,
        overlayManager,
    )

    const ThemePicker = await themePickerPromise
    ThemePicker.activate(configuration, menuManager, Themes.getThemeManagerInstance())

    const Bookmarks = await import("./Services/Bookmarks")
    Bookmarks.activate(configuration, editorManager, Sidebar.getInstance())

    const PluginsSidebarPane = await import("./Plugins/PluginSidebarPane")
    PluginsSidebarPane.activate(commandManager, configuration, pluginManager, sidebarManager)

    const Terminal = await terminalPromise
    Terminal.activate(commandManager, configuration, editorManager)

    const Particles = await import("./Services/Particles")
    Particles.activate(commandManager, configuration, editorManager, overlayManager)

    const PluginConfigurationSynchronizer = await import("./Plugins/PluginConfigurationSynchronizer")
    PluginConfigurationSynchronizer.activate(configuration, pluginManager)

    const Achievements = await import("./Services/Learning/Achievements")
    const achievements = Achievements.getInstance()

    if (achievements) {
        Debug.registerAchievements(achievements)
        Sneak.registerAchievements(achievements)
        Browser.registerAchievements(achievements)
    }

    Performance.endMeasure("Oni.Start.Activate")

    checkForUpdates()

    commandManager.registerCommand({
        command: "oni.quit",
        name: null,
        detail: null,
        execute: () => quit(),
    })

    Performance.endMeasure("Oni.Start")
    ipcRenderer.send("Oni.started", "started")
    _initializePromise.resolve()
}

const checkForUpdates = async (): Promise<void> => {
    const AutoUpdate = await import("./Services/AutoUpdate")
    const { autoUpdater, constructFeedUrl } = AutoUpdate

    const feedUrl = await constructFeedUrl("https://api.onivim.io/v1/update")

    autoUpdater.onUpdateAvailable.subscribe(() => Log.info("Update available."))
    autoUpdater.onUpdateNotAvailable.subscribe(() => Log.info("Update not available."))

    autoUpdater.checkForUpdates(feedUrl)
}
