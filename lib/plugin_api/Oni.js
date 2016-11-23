"use strict";
const events_1 = require("events");
const electron_1 = require("electron");
const Sender = require("./Sender");
const Diagnostics_1 = require("./Diagnostics");
const DebouncedLanguageService_1 = require("./DebouncedLanguageService");
/**
 * API instance for interacting with Oni (and vim)
 */
class Oni extends events_1.EventEmitter {
    constructor() {
        super();
        this._diagnostics = new Diagnostics_1.Diagnostics();
        electron_1.ipcRenderer.on("cross-browser-ipc", (event, arg) => {
            this._handleNotification(arg);
        });
    }
    get diagnostics() {
        return this._diagnostics;
    }
    _handleNotification(arg) {
        if (arg.type === "buffer-update") {
            this.emit("buffer-update", arg.payload);
        }
        else if (arg.type === "event") {
            console.log("event: " + arg.payload.name + "|" + arg.payload.context);
            if (arg.payload.name === "CursorMoved") {
                this.emit("cursor-moved", arg.payload.context);
                this.emit("CursorMoved", arg.payload.context);
            }
            else if (arg.payload.name === "BufWritePost") {
                this.emit("buffer-saved", arg.payload.context);
                this.emit("BufWritePost", arg.payload.context);
            }
        }
        else if (arg.type === "request") {
            console.log("request: " + arg.payload.name);
            const requestType = arg.payload.name;
            const originalContext = arg.payload.context;
            switch (requestType) {
                case "quick-info":
                    this._languageService.getQuickInfo(arg.payload.context)
                        .then((quickInfo) => {
                        Sender.send("show-quick-info", originalContext, {
                            info: quickInfo.title,
                            documentation: quickInfo.description
                        });
                    });
                    break;
                case "goto-definition":
                    this._languageService.getDefinition(arg.payload.context)
                        .then((definitionPosition) => {
                        Sender.send("goto-definition", originalContext, {
                            filePath: definitionPosition.filePath,
                            line: definitionPosition.line,
                            column: definitionPosition.column
                        });
                    });
                    break;
                case "completion-provider":
                    this._languageService.getCompletions(arg.payload.context)
                        .then(completions => {
                        Sender.send("completion-provider", originalContext, completions);
                    });
                    break;
                case "completion-provider-item-selected":
                    console.log("completion-provider-item-selected");
                    this._languageService.getCompletionDetails(arg.payload.context, arg.payload.item)
                        .then((details) => {
                        Sender.send("completion-provider-item-selected", originalContext, {
                            details: details
                        });
                    });
                    break;
                case "format":
                    this._languageService.getFormattingEdits(arg.payload.context)
                        .then((formattingResponse) => {
                        Sender.send("format", originalContext, formattingResponse);
                    });
                    break;
            }
        }
        else {
            console.warn("Unknown notification type");
        }
    }
    registerLanguageService(languageService) {
        this._languageService = new DebouncedLanguageService_1.DebouncedLanguageService(languageService);
    }
}
exports.Oni = Oni;
//# sourceMappingURL=Oni.js.map