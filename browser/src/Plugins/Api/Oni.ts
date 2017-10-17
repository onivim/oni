import * as ChildProcess from "child_process"
import { EventEmitter } from "events"

import { IPluginChannel } from "./Channel"
import { Diagnostics } from "./Diagnostics"

import { DebouncedLanguageService } from "./DebouncedLanguageService"
import { InitializationParamsCreator, LanguageClient, ServerRunOptions } from "./LanguageClient/LanguageClient"

import * as Process from "./Process"
import { Services } from "./Services"
import { Ui } from "./Ui"

import { commandManager } from "./../../Services/CommandManager"
import { configuration } from "./../../Services/Configuration"
import { editorManager } from "./../../Services/EditorManager"
import { inputManager } from "./../../Services/InputManager"
import { languageManager } from "./../../Services/Language"
import { menuManager } from "./../../Services/Menu"
import { recorder } from "./../../Services/Recorder"
import { statusBar } from "./../../Services/StatusBar"
import { windowManager, WindowManager } from "./../../Services/WindowManager"

import * as Log from "./../../Log"

import * as UI from "./../../UI"

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
    private _languageService: Oni.Plugin.LanguageService
    private _diagnostics: Oni.Plugin.Diagnostics.Api
    private _ui: Ui
    private _services: Services

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

    public get helpers(): any {
        return helpers
    }

    constructor(private _channel: IPluginChannel) {
        super()

        this._diagnostics = new Diagnostics(this._channel)
        this._dependencies = new Dependencies()
        this._ui = new Ui(react)
        this._services = new Services()

        this._channel.onRequest((arg: any) => {
            this._handleNotification(arg)
        })
    }

    public createLanguageClient(startOptions: ServerRunOptions, initializationParamsCreator: InitializationParamsCreator): LanguageClient {
        return new LanguageClient(startOptions, initializationParamsCreator, this)
    }

    public registerLanguageService(languageService: Oni.Plugin.LanguageService): void {
        this._languageService = new DebouncedLanguageService(languageService)
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

    public setHighlights(file: string, key: string, highlights: Oni.Plugin.SyntaxHighlight[]) {
        this._channel.send("set-syntax-highlights", null, {
            file,
            key,
            highlights,
        })
    }

    public clearHighlights(file: string, key: string): void {
        this._channel.send("clear-syntax-highlights", null, {
            file,
            key,
        })
    }

    private _handleNotification(arg: any): void {
        if (arg.type === "buffer-update") {
            this.emit("buffer-update", arg.payload)
        } else if (arg.type === "buffer-update-incremental") {
            this.emit("buffer-update-incremental", arg.payload)
        } else if (arg.type === "event") {

            if (arg.payload.name === "CursorMoved") {
                this.emit("cursor-moved", arg.payload.context)
            } else if (arg.payload.name === "CursorMovedI") {
                this.emit("cursor-moved", arg.payload.context)
            } else if (arg.payload.name === "BufWritePost") {
                this.emit("buffer-saved", arg.payload.context)
            } else if (arg.payload.name === "BufEnter") {
                this.emit("buffer-enter", arg.payload.context)
            } else if (arg.payload.name === "BufLeave") {
                this.emit("buffer-leave", arg.payload.context)
            }

            this.emit(arg.payload.name, arg.payload.context)
        } else if (arg.type === "request") {
            const requestType = arg.payload.name

            const originalContext = arg.payload.context

            const languageService = this._languageService || null
            if (!languageService) {
                return
            }

            switch (requestType) {
                case "quick-info":
                    this._languageService.getQuickInfo(arg.payload.context)
                        .then((quickInfo) => {
                            if (quickInfo && quickInfo.title) {
                                this._channel.send("show-quick-info", originalContext, {
                                    info: quickInfo.title,
                                    documentation: quickInfo.description,
                                })
                            } else {
                                this._channel.send("show-quick-info", originalContext, {
                                    info: null,
                                    documentation: null,
                                })
                            }
                        }, (err) => {
                            this._channel.send("show-quick-info", originalContext, {
                                info: null,
                                documentation: null,
                            })
                        })
                    break
                case "goto-definition":
                    languageService.getDefinition(arg.payload.context)
                        .then((definitionPosition) => {
                            this._channel.send("goto-definition", originalContext, {
                                filePath: definitionPosition.filePath,
                                line: definitionPosition.line,
                                column: definitionPosition.column,
                            })
                        })
                    break
                case "find-all-references":
                    languageService.findAllReferences(arg.payload.context)
                        .then((references) => {
                            this._channel.send("find-all-references", originalContext, {
                                references,
                            })
                        })
                    break
                case "completion-provider":
                    languageService.getCompletions(arg.payload.context)
                        .then((completions) => {
                            this._channel.send("completion-provider", originalContext, completions)
                        }, (err) => {
                            this._channel.sendError("completion-provider", originalContext, err)
                        })
                    break
                case "completion-provider-item-selected":
                    languageService.getCompletionDetails(arg.payload.context, arg.payload.item)
                        .then((details) => {
                            this._channel.send("completion-provider-item-selected", originalContext, {
                                details,
                            })
                        })
                    break
                case "format":
                    languageService.getFormattingEdits(arg.payload.context)
                        .then((formattingResponse) => {
                            this._channel.send("format", originalContext, formattingResponse)
                        })
                    break
                case "signature-help":
                    languageService.getSignatureHelp(arg.payload.context)
                        .then((val) => {
                            UI.Actions.showSignatureHelp(val)
                        }, (err) => {
                            UI.Actions.hideSignatureHelp()
                        })
                    break
                default:
                    Log.warn(`Unknown request type: ${requestType}`)

            }
        } else {
            Log.warn("Unknown notification type")
        }
    }
}
