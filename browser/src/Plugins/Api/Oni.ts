/**
 * OniApi.ts
 *
 * Implementation of OniApi's API surface
 * TODO: Gradually move over to `oni-api`
 */

import * as ChildProcess from "child_process"
import { EventEmitter } from "events"

import * as OniApi from "oni-api"

import * as Process from "./Process"
import { Services } from "./Services"
import { Ui } from "./Ui"

import { automation } from "./../../Services/Automation"
import { Colors, getInstance as getColors } from "./../../Services/Colors"
import { commandManager } from "./../../Services/CommandManager"
import { configuration } from "./../../Services/Configuration"
import { getInstance as getDiagnosticsInstance } from "./../../Services/Diagnostics"
import { editorManager } from "./../../Services/EditorManager"
import { inputManager } from "./../../Services/InputManager"
import * as LanguageManager from "./../../Services/Language"
import { menuManager } from "./../../Services/Menu"
import { recorder } from "./../../Services/Recorder"
import { getInstance as getSidebarInstance } from "./../../Services/Sidebar"
import { getInstance as getStatusBarInstance } from "./../../Services/StatusBar"
import { getThemeManagerInstance } from "./../../Services/Themes"
import { windowManager } from "./../../Services/WindowManager"
import { workspace } from "./../../Services/Workspace"

import { NeovimEditor } from "./../../Editor/NeovimEditor"

import * as Log from "./../../Log"

import * as throttle from "lodash/throttle"

const react = require("react") // tslint:disable-line no-var-requires

export class Dependencies {
    public get React(): any {
        return react
    }
}

const helpers = {
    throttle,
}

/**
 * API instance for interacting with OniApi (and vim)
 */
export class Oni extends EventEmitter implements OniApi.Plugin.Api {
    private _dependencies: Dependencies
    private _ui: Ui
    private _services: Services
    private _colors: Colors

    public get automation(): OniApi.Automation.Api {
        return automation
    }

    public get colors(): Colors /* TODO: Promote to API */ {
        return this._colors
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

    public get recorder(): any {
        return recorder
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

    public get input(): OniApi.InputManager {
        return inputManager
    }

    public get language(): any {
        return LanguageManager.getInstance()
    }

    public get menu(): any /* TODO */ {
        return menuManager
    }

    public get process(): OniApi.Process {
        return Process
    }

    public get sidebar(): any {
        return getSidebarInstance()
    }

    public get statusBar(): OniApi.StatusBar {
        return getStatusBarInstance()
    }

    public get ui(): Ui {
        return this._ui
    }

    public get services(): Services {
        return this._services
    }

    public get windows(): OniApi.IWindowManager {
        return windowManager
    }

    public get workspace(): OniApi.Workspace {
        return workspace
    }

    public get helpers(): any {
        return helpers
    }

    public createNeovimEditor(): NeovimEditor {
        const editor = new NeovimEditor(getColors(), configuration, getDiagnosticsInstance(), this.language, getThemeManagerInstance())
        return editor
    }


    constructor() {
        super()
        this._colors = getColors()

        this._dependencies = new Dependencies()
        this._ui = new Ui(react)
        this._services = new Services()
    }

    public async execNodeScript(scriptPath: string, args: string[] = [], options: ChildProcess.ExecOptions = {}, callback: (err: any, stdout: string, stderr: string) => void): Promise<ChildProcess.ChildProcess> {
        Log.warn("WARNING: `OniApi.execNodeScript` is deprecated. Please use `OniApi.process.execNodeScript` instead")

        return await Process.execNodeScript(scriptPath, args, options, callback)
    }

    /**
     * Wrapper around `child_process.exec` to run using electron as opposed to node
     */
    public async spawnNodeScript(scriptPath: string, args: string[] = [], options: ChildProcess.SpawnOptions = {}): Promise<ChildProcess.ChildProcess> {

        Log.warn("WARNING: `OniApi.spawnNodeScript` is deprecated. Please use `OniApi.process.spawnNodeScript` instead")

        return await Process.spawnNodeScript(scriptPath, args, options)
    }
}
