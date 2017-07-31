import * as ChildProcess from "child_process"
import { EventEmitter } from "events"

import { IPluginChannel } from "./Channel"

import { Commands } from "./Commands"
import { Configuration } from "./Configuration"
import { Diagnostics } from "./Diagnostics"
import { Editor } from "./Editor"
import { StatusBar } from "./StatusBar"

import { DebouncedLanguageService } from "./DebouncedLanguageService"
import { InitializationParamsCreator, LanguageClient } from "./LanguageClient/LanguageClient"

import { Process } from "./Process"
import { Services } from "./Services"
import { Ui } from "./Ui"

const react = require("react") // tslint:disable-line no-var-requires

export class Dependencies {
    public get React(): any {
        return react
    }
}

/**
 * API instance for interacting with Oni (and vim)
 */
export class Oni extends EventEmitter implements Oni.Plugin.Api {

    private _configuration: Oni.Configuration
    private _dependencies: Dependencies
    private _editor: Oni.Editor
    private _statusBar: StatusBar
    private _commands: Commands
    private _languageService: Oni.Plugin.LanguageService
    private _diagnostics: Oni.Plugin.Diagnostics.Api
    private _ui: Ui
    private _services: Services
    private _process: Process

    public get commands(): Oni.Commands {
        return this._commands
    }

    public get configuration(): Oni.Configuration {
        return this._configuration
    }

    public get diagnostics(): Oni.Plugin.Diagnostics.Api {
        return this._diagnostics
    }

    public get dependencies(): Dependencies {
        return this._dependencies
    }

    public get editor(): Oni.Editor {
        return this._editor
    }

    public get process(): Oni.Process {
        return this._process
    }

    public get statusBar(): StatusBar {
        return this._statusBar
    }

    public get ui(): Ui {
        return this._ui
    }

    public get services(): Services {
        return this._services
    }

    constructor(private _channel: IPluginChannel) {
        super()

        this._configuration = new Configuration()
        this._diagnostics = new Diagnostics(this._channel)
        this._dependencies = new Dependencies()
        this._editor = new Editor(this._channel)
        this._commands = new Commands()
        this._statusBar = new StatusBar(this._channel)
        this._ui = new Ui(react)
        this._services = new Services()
        this._process = new Process()

        this._channel.onRequest((arg: any) => {
            this._handleNotification(arg)
        })
    }

    public createLanguageClient(initializationCommand: string, initializationParamsCreator: InitializationParamsCreator): LanguageClient {
        return new LanguageClient(initializationCommand, initializationParamsCreator, this)
    }

    public registerLanguageService(languageService: Oni.Plugin.LanguageService): void {
        this._languageService = new DebouncedLanguageService(languageService)
    }

    public execNodeScript(scriptPath: string, args: string[] = [], options: ChildProcess.ExecOptions = {}, callback: (err: any, stdout: string, stderr: string) => void): ChildProcess.ChildProcess {
        console.warn("WARNING: `Oni.execNodeScript` is deprecated. Please use `Oni.process.execNodeScript` instead") // tslint:disable-line no-console-log

        return this._process.execNodeScript(scriptPath, args, options, callback)
    }

    /**
     * Wrapper around `child_process.exec` to run using electron as opposed to node
     */
    public spawnNodeScript(scriptPath: string, args: string[] = [], options: ChildProcess.SpawnOptions = {}): ChildProcess.ChildProcess {

        console.warn("WARNING: `Oni.spawnNodeScript` is deprecated. Please use `Oni.process.spawnNodeScript` instead") // tslint:disable-line no-console-log

        return this._process.spawnNodeScript(scriptPath, args, options)
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
        } else if (arg.type === "command") {
            this._commands.onCommand(arg.payload.command, arg.payload.args)
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
                                this._channel.send("clear-quick-info", originalContext, null)
                            }
                        }, (err) => {
                            this._channel.sendError("show-quick-info", originalContext, err)
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
                case "evaluate-block":
                    languageService.evaluateBlock(arg.payload.context, arg.payload.id, arg.payload.fileName, arg.payload.code)
                        .then((val) => {
                            this._channel.send("evaluate-block-result", originalContext, val)
                        })
                    break
                case "signature-help":
                    languageService.getSignatureHelp(arg.payload.context)
                        .then((val) => {
                            this._channel.send("signature-help-response", originalContext, val)
                        }, (err) => {
                            this._channel.sendError("signature-help-response", originalContext, err)
                        })
                    break
                default:
                    console.warn(`Unknown request type: ${requestType}`)

            }
        } else {
            console.warn("Unknown notification type")
        }
    }
}
