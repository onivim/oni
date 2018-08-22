/**
 * OniApi.ts
 *
 * Implementation of OniApi's API surface
 * TODO: Gradually move over to `oni-api`
 */

import * as ChildProcess from "child_process"

import * as OniApi from "oni-api"
import * as Log from "oni-core-logging"

import Process from "./Process"
import { Services } from "./Services"
import { Ui } from "./Ui"

import { getInstance as getPluginsManagerInstance } from "./../PluginManager"

import { automation } from "./../../Services/Automation"
import { Colors, getInstance as getColors } from "./../../Services/Colors"
import { commandManager } from "./../../Services/CommandManager"
import { getInstance as getCompletionProvidersInstance } from "./../../Services/Completion/CompletionProviders"
import { configuration } from "./../../Services/Configuration"
import { getInstance as getDiagnosticsInstance } from "./../../Services/Diagnostics"
import { editorManager } from "./../../Services/EditorManager"
import { inputManager } from "./../../Services/InputManager"
import * as LanguageManager from "./../../Services/Language"
import { getTutorialManagerInstance } from "./../../Services/Learning"
import { getInstance as getAchievementsInstance } from "./../../Services/Learning/Achievements"
import { getInstance as getMenuManagerInstance } from "./../../Services/Menu"
import { getInstance as getFiltersInstance } from "./../../Services/Menu/Filter"
import { getInstance as getNotificationsInstance } from "./../../Services/Notifications"
import { getInstance as getOverlayInstance } from "./../../Services/Overlay"
import { recorder } from "./../../Services/Recorder"
import { getInstance as getSidebarInstance } from "./../../Services/Sidebar"
import { getInstance as getSneakInstance } from "./../../Services/Sneak"
import { getInstance as getSnippetsInstance } from "./../../Services/Snippets"
import { getInstance as getStatusBarInstance } from "./../../Services/StatusBar"
import { getInstance as getTokenColorsInstance } from "./../../Services/TokenColors"
import { windowManager } from "./../../Services/WindowManager"
import { getInstance as getWorkspaceInstance } from "./../../Services/Workspace"

import { Search } from "./../../Services/Search/SearchProvider"

import * as throttle from "lodash/throttle"

const react = require("react") // tslint:disable-line no-var-requires

export class Dependencies {
    public get React(): any {
        return react
    }
}

class Helpers {
    constructor(private _oni: OniApi.Plugin.Api) {}
    throttle = throttle
    public getActiveSection() {
        const isInsertOrCommandMode = () => {
            return (
                this._oni.editors.activeEditor.mode === "insert" ||
                this._oni.editors.activeEditor.mode === "cmdline_normal"
            )
        }
        switch (true) {
            case this._oni.menu.isMenuOpen():
                return "menu"
            case this._oni.sidebar.isFocused:
                return this._oni.sidebar.activeEntryId
            case isInsertOrCommandMode():
                return "commandline"
            default:
                return null
        }
    }
}

/**
 * API instance for interacting with OniApi (and vim)
 */
export class Oni implements OniApi.Plugin.Api {
    private _dependencies: Dependencies
    private _ui: Ui
    private _services: Services

    public get achievements(): any /* TODO: Promote to API */ {
        return getAchievementsInstance()
    }

    public get automation(): OniApi.Automation.Api {
        return automation
    }

    public get colors(): Colors /* TODO: Promote to API */ {
        return getColors()
    }

    public get commands(): OniApi.Commands.Api {
        return commandManager
    }

    public get contextMenu(): any {
        return null
    }

    public get log(): OniApi.Log {
        return Log
    }

    public get plugins(): any {
        return getPluginsManagerInstance()
    }

    public get recorder(): any {
        return recorder
    }

    public get completions(): any {
        return getCompletionProvidersInstance()
    }

    public get configuration(): OniApi.Configuration {
        return configuration
    }

    public get diagnostics(): OniApi.Plugin.Diagnostics.Api {
        return getDiagnosticsInstance()
    }

    public get dependencies(): Dependencies {
        return this._dependencies
    }

    public get editors(): OniApi.EditorManager {
        return editorManager
    }

    public get input(): OniApi.Input.InputManager {
        return inputManager
    }

    public get language(): any {
        return LanguageManager.getInstance()
    }

    public get menu(): any /* TODO */ {
        return getMenuManagerInstance()
    }

    public get filter(): OniApi.Menu.IMenuFilters {
        return getFiltersInstance("") // TODO: Pass either "core" or plugin's name
    }

    public get notifications(): OniApi.Notifications.Api {
        return getNotificationsInstance()
    }

    public get overlays(): OniApi.Overlays.Api {
        return getOverlayInstance()
    }

    public get process(): OniApi.Process {
        return Process
    }

    public get sidebar(): any {
        return getSidebarInstance()
    }

    public get sneak(): any {
        return getSneakInstance()
    }

    public get snippets(): OniApi.Snippets.SnippetManager {
        return getSnippetsInstance()
    }

    public get statusBar(): OniApi.StatusBar {
        return getStatusBarInstance()
    }

    public get tokenColors(): any {
        return getTokenColorsInstance()
    }

    public get ui(): Ui {
        return this._ui
    }

    public get services(): Services {
        return this._services
    }

    public get tutorials(): any /* todo */ {
        return getTutorialManagerInstance()
    }

    public get windows(): OniApi.IWindowManager {
        return windowManager as any
    }

    public get workspace(): OniApi.Workspace.Api {
        return getWorkspaceInstance()
    }

    public get helpers(): Helpers {
        const helpers = new Helpers(this)
        return helpers
    }

    public get search(): OniApi.Search.ISearch {
        return new Search()
    }

    constructor() {
        this._dependencies = new Dependencies()
        this._ui = new Ui(react)
        this._services = new Services()
    }

    public populateQuickFix(entries: OniApi.QuickFixEntry[]): void {
        const neovim: any = editorManager.activeEditor.neovim
        neovim.quickFix.setqflist(entries, "Search Results")
        neovim.command(":copen")
    }

    public async execNodeScript(
        scriptPath: string,
        args: string[] = [],
        options: ChildProcess.ExecOptions = {},
        callback: (err: any, stdout: string, stderr: string) => void,
    ): Promise<ChildProcess.ChildProcess> {
        Log.warn(
            "WARNING: `OniApi.execNodeScript` is deprecated. Please use `OniApi.process.execNodeScript` instead",
        )

        return Process.execNodeScript(scriptPath, args, options, callback)
    }

    /**
     * Wrapper around `child_process.exec` to run using electron as opposed to node
     */
    public async spawnNodeScript(
        scriptPath: string,
        args: string[] = [],
        options: ChildProcess.SpawnOptions = {},
    ): Promise<ChildProcess.ChildProcess> {
        Log.warn(
            "WARNING: `OniApi.spawnNodeScript` is deprecated. Please use `OniApi.process.spawnNodeScript` instead",
        )

        return Process.spawnNodeScript(scriptPath, args, options)
    }
}
