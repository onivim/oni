import * as ChildProcess from "child_process"
import { EventEmitter } from "events"

import { Diagnostics } from "./Diagnostics"

import * as Process from "./Process"
import { Services } from "./Services"
import { Ui } from "./Ui"

import { automation } from "./../../Services/Automation"
import { commandManager } from "./../../Services/CommandManager"
import { configuration } from "./../../Services/Configuration"
import { contextMenuManager } from "./../../Services/ContextMenu"
import { editorManager } from "./../../Services/EditorManager"
import { inputManager } from "./../../Services/InputManager"
import { languageManager } from "./../../Services/Language"
import { menuManager } from "./../../Services/Menu"
import { recorder } from "./../../Services/Recorder"
import { statusBar } from "./../../Services/StatusBar"
import { windowManager, WindowManager } from "./../../Services/WindowManager"
import { workspace } from "./../../Services/Workspace"

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
 * API instance for interacting with Oni (and vim)
 */
export class Oni extends EventEmitter implements Oni.Plugin.Api {

    private _dependencies: Dependencies
    private _diagnostics: Oni.Plugin.Diagnostics.Api
    private _ui: Ui
    private _services: Services

    public get automation(): Oni.Automation.Api {
        return automation
    }

    public get commands(): Oni.Commands {
        return commandManager
    }

    public get log(): Oni.Log {
        return Log
    }

    public get recorder(): any {
        return recorder
    }

    public get configuration(): Oni.Configuration {
        return configuration
    }

    public get contextMenu(): any {
        return contextMenuManager
    }

    public get diagnostics(): Oni.Plugin.Diagnostics.Api {
        return this._diagnostics
    }

    public get dependencies(): Dependencies {
        return this._dependencies
    }

    public get editors(): Oni.EditorManager {
        return editorManager
    }

    public get input(): Oni.InputManager {
        return inputManager
    }

    public get language(): any {
        return languageManager
    }

    public get menu(): any /* TODO */ {
        return menuManager
    }

    public get process(): Oni.Process {
        return Process
    }

    public get statusBar(): Oni.StatusBar {
        return statusBar
    }

    public get ui(): Ui {
        return this._ui
    }

    public get services(): Services {
        return this._services
    }

    public get windows(): WindowManager {
        return windowManager
    }

    public get workspace(): Oni.Workspace {
        return workspace
    }

    public get helpers(): any {
        return helpers
    }

    constructor() {
        super()

        this._diagnostics = new Diagnostics()
        this._dependencies = new Dependencies()
        this._ui = new Ui(react)
        this._services = new Services()
    }

    public execNodeScript(scriptPath: string, args: string[] = [], options: ChildProcess.ExecOptions = {}, callback: (err: any, stdout: string, stderr: string) => void): ChildProcess.ChildProcess {
        Log.warn("WARNING: `Oni.execNodeScript` is deprecated. Please use `Oni.process.execNodeScript` instead")

        return Process.execNodeScript(scriptPath, args, options, callback)
    }

    /**
     * Wrapper around `child_process.exec` to run using electron as opposed to node
     */
    public spawnNodeScript(scriptPath: string, args: string[] = [], options: ChildProcess.SpawnOptions = {}): ChildProcess.ChildProcess {

        Log.warn("WARNING: `Oni.spawnNodeScript` is deprecated. Please use `Oni.process.spawnNodeScript` instead")

        return Process.spawnNodeScript(scriptPath, args, options)
    }
}
