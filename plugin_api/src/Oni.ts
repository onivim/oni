import { EventEmitter } from "events"
import { ipcRenderer } from "electron"

import { ISender, IpcSender } from "./Sender"
import { Diagnostics } from "./Diagnostics"
import { Editor } from "./Editor"

import { DebouncedLanguageService } from "./DebouncedLanguageService"

/**
 * API instance for interacting with Oni (and vim)
 */
export class Oni extends EventEmitter implements Oni.Plugin.Api {

    private _editor: Oni.Editor = new Editor()
    private _languageService: Oni.Plugin.LanguageService
    private _diagnostics: Oni.Plugin.Diagnostics.Api = new Diagnostics()

    public get diagnostics(): Oni.Plugin.Diagnostics.Api {
        return this._diagnostics
    }

    public get editor(): Oni.Editor {
        return this._editor
    }

    constructor(private _sender: ISender = new IpcSender()) {
        super()

        this._diagnostics = new Diagnostics(this._sender);

        ipcRenderer.on("cross-browser-ipc", (_event, arg) => {
            this._handleNotification(arg)
        })
    }

    private _handleNotification(arg: any): void {
        if (arg.type === "buffer-update") {
            this.emit("buffer-update", arg.payload)
        } else if (arg.type === "event") {
            console.log("event: " + arg.payload.name + "|" + arg.payload.context)

            if (arg.payload.name === "CursorMoved") {
                this.emit("cursor-moved", arg.payload.context);
                this.emit("CursorMoved", arg.payload.context);
            } else if (arg.payload.name === "BufWritePost") {
                this.emit("buffer-saved", arg.payload.context)
                this.emit("BufWritePost", arg.payload.context)
            } else if (arg.payload.name === "BufEnter") {
                this.emit("buffer-enter", arg.payload.context)
                this.emit("BufEnter", arg.payload.context)
            }
        } else if (arg.type === "request") {
            console.log("request: " + arg.payload.name);
            const requestType = arg.payload.name;

            const originalContext = arg.payload.context

            const languageService = this._languageService
            if (!languageService)
                return

            switch (requestType) {
                case "quick-info":
                    languageService.getQuickInfo(arg.payload.context)
                        .then((quickInfo) => {
                            this._sender.send("show-quick-info", originalContext, {
                                info: quickInfo.title,
                                documentation: quickInfo.description
                            })
                        }, (err) => {
                            this._sender.sendError("show-quick-info", originalContext, err)
                        })
                    break
                case "goto-definition":
                    languageService.getDefinition(arg.payload.context)
                        .then((definitionPosition) => {
                            this._sender.send("goto-definition", originalContext, {
                                filePath: definitionPosition.filePath,
                                line: definitionPosition.line,
                                column: definitionPosition.column
                            })
                        })
                    break
                case "completion-provider":
                    languageService.getCompletions(arg.payload.context)
                        .then(completions => {
                            this._sender.send("completion-provider", originalContext, completions)
                        }, (err) => {
                            this._sender.sendError("completion-provider", originalContext, err)
                        })
                    break
                case "completion-provider-item-selected":
                    console.log("completion-provider-item-selected")
                    languageService.getCompletionDetails(arg.payload.context, arg.payload.item)
                        .then((details) => {
                            this._sender.send("completion-provider-item-selected", originalContext, {
                                details: details
                            })
                        })
                    break
                case "format":
                    languageService.getFormattingEdits(arg.payload.context)
                        .then((formattingResponse) => {
                            this._sender.send("format", originalContext, formattingResponse)
                        })
                    break
                case "evaluate-block":
                    languageService.evaluateBlock(arg.payload.context, arg.payload.id, arg.payload.fileName, arg.payload.code)
                        .then((val) => {
                            this._sender.send("evaluate-block-result", originalContext, val)
                        })
                    break
                case "signature-help":
                    languageService.getSignatureHelp(arg.payload.context)
                        .then((val) => {
                            this._sender.send("signature-help-response", originalContext, val)
                        }, (err) => {
                            this._sender.sendError("signature-help-response", originalContext, err)
                        })

            }
        } else {
            console.warn("Unknown notification type")
        }
    }

    public registerLanguageService(languageService: Oni.Plugin.LanguageService): void {
        this._languageService = new DebouncedLanguageService(languageService)
    }

    public setHighlights(file: string, key: string, highlights: Oni.Plugin.SyntaxHighlight[]) {
        this._sender.send("set-syntax-highlights", null, {
            file: file,
            key: key,
            highlights: highlights
        })
    }

    public clearHighlights(file: string, key: string): void {
        this._sender.send("clear-syntax-highlights", null, {
            file: file,
            key: key
        })
    }
}
