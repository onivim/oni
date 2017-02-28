import { EventEmitter } from "events"

import { IPluginChannel } from "./Channel"

import { Commands } from "./Commands"
import { Diagnostics } from "./Diagnostics"
import { Editor } from "./Editor"

import { DebouncedLanguageService } from "./DebouncedLanguageService"

/**
 * API instance for interacting with Oni (and vim)
 */
export class Oni extends EventEmitter implements Oni.Plugin.Api {

    private _editor: Oni.Editor
    private _commands: Commands
    private _languageService: Oni.Plugin.LanguageService
    private _diagnostics: Oni.Plugin.Diagnostics.Api

    public get diagnostics(): Oni.Plugin.Diagnostics.Api {
        return this._diagnostics
    }

    public get editor(): Oni.Editor {
        return this._editor
    }

    public get commands(): Oni.Commands {
        return this._commands
    }

    constructor(private _channel: IPluginChannel) {
        super()

        this._diagnostics = new Diagnostics(this._channel)
        this._editor = new Editor(this._channel)
        this._commands = new Commands()

        this._channel.onRequest((arg: any) => {
            this._handleNotification(arg)
        })
    }

    public registerLanguageService(languageService: Oni.Plugin.LanguageService): void {
        this._languageService = new DebouncedLanguageService(languageService)
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
                this.emit("CursorMoved", arg.payload.context)
            } else if (arg.payload.name === "BufWritePost") {
                this.emit("buffer-saved", arg.payload.context)
                this.emit("BufWritePost", arg.payload.context)
            } else if (arg.payload.name === "BufEnter") {
                this.emit("buffer-enter", arg.payload.context)
                this.emit("BufEnter", arg.payload.context)
            }
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
