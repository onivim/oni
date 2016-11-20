
import { EventEmitter } from "events"
import { ipcRenderer } from "electron"

import * as Sender from "./Sender"
import { Diagnostics } from "./Diagnostics"

import { DebouncedLanguageService } from "./DebouncedLanguageService"

/**
 * API instance for interacting with Oni (and vim)
 */
export class Oni extends EventEmitter implements Oni.Plugin.Api {

    private _languageService: Oni.Plugin.LanguageService
    private _diagnostics: Oni.Plugin.Diagnostics.Api = new Diagnostics()

    public get diagnostics(): Oni.Plugin.Diagnostics.Api {
        return this._diagnostics
    }

    constructor() {
        super()
        ipcRenderer.on("cross-browser-ipc", (event, arg) => {
            this._handleNotification(arg)
        })
    }

    private _handleNotification(arg) {
        if (arg.type === "buffer-update") {
            this.emit("buffer-update", arg.payload)
        } else if (arg.type === "event") {
            console.log("event: " + arg.payload.name + "|" + arg.payload.context)

            if(arg.payload.name === "CursorMoved") {
                this.emit("cursor-moved", arg.payload.context);
                this.emit("CursorMoved", arg.payload.context);
            }
        } else if (arg.type === "request") {
            console.log("request: " + arg.payload.name);
            const requestType = arg.payload.name;

            switch(requestType) {
                case "quick-info":
                    this._languageService.getQuickInfo(arg.payload.context)
                        .then((quickInfo) => {
                                Sender.send("show-quick-info", {
                                    info: quickInfo.title,
                                    documentation: quickInfo.description
                                })
                            })
                    break
                case "goto-definition":
                    this._languageService.getDefinition(arg.payload.context)
                        .then((definitionPosition) => {
                                Sender.send("goto-definition", {
                                    filePath: definitionPosition.filePath,
                                    line: definitionPosition.line,
                                    column: definitionPosition.column
                                })
                            })
                    break
                case "completion-provider":
                    this._languageService.getCompletions(arg.payload.context)
                        .then(completions => {
                                Sender.send("completion-provider", completions)
                            })
                        break
                case "completion-provider-item-selected":
                    console.log("completion-provider-item-selected")
                    this._languageService.getCompletionDetails(arg.payload.context, arg.payload.item)
                        .then((details) => {
                                Sender.send("completion-provider-item-selected", {
                                    details: details
                                })
                            })
                    break
            }
        } else {
            console.warn("Unknown notification type")
        }
    }

    public registerLanguageService(languageService: Oni.Plugin.LanguageService): void {
        this._languageService =  new DebouncedLanguageService(languageService)
    }
}

