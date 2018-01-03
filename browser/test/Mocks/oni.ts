/**
 * Mocks/oni.ts
 *
 * Implementations of test mocks and doubles,
 * for Oni's API interface.
 */

import { EventEmitter } from "events"
import * as OniApi from "oni-api"

import { Automation } from "./../../src/Services/Automation"
import { Colors } from "./../../src/Services/Colors"
import { CommandManager } from "./../../src/Services/CommandManager"
import { Configuration } from "./../../src/Services/Configuration"
import { DiagnosticsDataSource } from "./../../src/Services/Diagnostics"
import { EditorManager } from "./../../src/Services/EditorManager"
import { InputManager } from "./../../src/Services/InputManager"
import { ThemeManager } from "./../../src/Services/Themes/ThemeManager"
import { MenuManager } from "./../../src/Services/Menu"
import { Process } from "./../../src/Plugins/Api/Process"
import { StatusBar } from "./../../src/Services/StatusBar"
import { Workspace } from "./../../src/Services/Workspace"
import { WindowManager } from "./../../src/Services/WindowManager"

import { MockPerformance } from "./Performance"

export class OniMock extends EventEmitter implements OniApi.Plugin.Api {
    private _configuration: Configuration
    private _commandManager: CommandManager
    private _editorManager: EditorManager
    private _statusBar: StatusBar
    private _windowManager: WindowManager
    private _menuManager: MenuManager
    private _diagnosticsDataSource: DiagnosticsDataSource
    private _colors: Colors
    private _inputManager: InputManager
    private _processManager: Process
    private _workspace: Workspace
    private _automation: Automation

    constructor() {
        super()

        const performance = new MockPerformance()
        const themeManager = new ThemeManager()
        const configuration = new Configuration(performance)
        configuration.start()
        const commandManager = new CommandManager()
        const editorManager = new EditorManager()
        const statusBar = new StatusBar()
        const windowManager = new WindowManager()
        const menuManager = new MenuManager()
        const diagnosticsDataSource = new DiagnosticsDataSource()
        const colors = new Colors(configuration, themeManager)
        const inputManager = new InputManager(commandManager)
        const processManager = new Process(configuration)
        const workspace = new Workspace(editorManager)
        const automation = new Automation(configuration, editorManager, inputManager)

        this._automation = automation
        this._colors = colors
        this._commandManager = commandManager
        this._configuration = configuration
        this._diagnosticsDataSource = diagnosticsDataSource
        this._editorManager = editorManager
        this._inputManager = inputManager
        this._menuManager = menuManager
        this._processManager = processManager
        this._statusBar = statusBar
        this._workspace = workspace
        this._windowManager = windowManager
    }

    public get automation(): OniApi.Automation.Api {
        return this._automation
    }

    public get colors(): OniApi.IColors {
        return this._colors
    }

    public get commands(): OniApi.Commands {
        return this._commandManager
    }

    public get configuration(): OniApi.Configuration {
        return this._configuration
    }

    public get contextMenu(): any {
        return null
    }

    public get diagnostics(): OniApi.Plugin.Diagnostics.Api {
        return this._diagnosticsDataSource
    }

    public get editors(): OniApi.EditorManager {
        return this._editorManager
    }

    public get input(): OniApi.InputManager {
        return this._inputManager
    }

    public get language(): any {
        return null
    }

    public get log(): OniApi.Log {
        return null
    }

    public get menu(): any {
        return this._menuManager
    }

    public get process(): OniApi.Process {
        return this._processManager
    }

    public get statusBar(): OniApi.StatusBar {
        return this._statusBar
    }

    public get workspace(): OniApi.Workspace {
        return this._workspace
    }

    public get windows(): OniApi.IWindowManager {
        return this._windowManager
    }
}
