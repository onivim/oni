import * as fs from "fs"
import * as path from "path"

import { Oni } from "./Api/Oni"
import { IChannel } from "./Api/Channel"

export interface IPluginMetadata {
    debugging: boolean
}

const DefaultMetadata: IPluginMetadata = {
    debugging: false,
}

// Subscription Events
export const VimEventsSubscription = "vim-events"
export const BufferUpdateEvents = "buffer-update"

// Language Service Capabilities
export const FormatCapability = "formatting"
export const QuickInfoCapability = "quick-info"
export const GotoDefinitionCapability = "goto-definition"
export const CompletionProviderCapability = "completion-provider"
export const EvaluateBlockCapability = "evaluate-block"
export const SignatureHelpCapability = "signature-help"

export interface IEventContext {
    bufferFullPath: string
    line: number
    column: number
    byte: number
    filetype: string
}

export interface IWebViewInfo {
    webViewElement: Electron.WebViewElement
    webContents: Electron.WebContents
}

export class Plugin {
    private _packageMetadata: any
    private _oniPluginMetadata: IPluginMetadata
    private _lastEventContext: IEventContext

    private _channel: IChannel

    constructor(pluginRootDirectory: string, channel: IChannel) {
        const packageJsonPath = path.join(pluginRootDirectory, "package.json")
        this._channel = channel

        if (fs.existsSync(packageJsonPath)) {
            this._packageMetadata = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))

            const engines = this._packageMetadata.engines

            // TODO: Handle oni engine version
            if (!engines || !engines["oni"]) { // tslint:disable-line no-string-literal
                console.warn("Aborting plugin load as Oni engine version not specified: " + packageJsonPath)
            } else {
                if (this._packageMetadata.main) {
                    let moduleEntryPoint = path.normalize(path.join(pluginRootDirectory, this._packageMetadata.main))
                    moduleEntryPoint = moduleEntryPoint.split("\\").join("/")
                    // this._initPromise = loadPluginInBrowser(moduleEntryPoint, null)

                    const vm = require("vm")

                    vm.runInNewContext(`debugger; require('${moduleEntryPoint}').activate(Oni); `, {
                     Oni: new Oni(this._channel.plugin),
                     require: window["require"],
                     console: console,
                    })
                }

                const pluginMetadata = this._packageMetadata.oni || {}

                this._expandMultipleLanguageKeys(pluginMetadata)

                this._oniPluginMetadata = Object.assign({}, DefaultMetadata, pluginMetadata)
            }
        }
    }

    public dispose(): void {

    }

    public requestGotoDefinition(eventContext: IEventContext): void {
        this._send({
            type: "request",
            payload: {
                name: "goto-definition",
                context: eventContext,
            },
        })
    }

    public notifyBufferUpdateEvent(eventContext: IEventContext, bufferLines: string[]): void {
        this._send({
            type: "buffer-update",
            payload: {
                eventContext,
                bufferLines,
            },
        })
    }

    public requestCompletions(eventContext: IEventContext): void {
        this._send({
            type: "request",
            payload: {
                name: "completion-provider",
                context: eventContext,
            },
        })
    }

    public requestSignatureHelp(eventContext: IEventContext): void {
        this._send({
            type: "request",
            payload: {
                name: "signature-help",
                context: eventContext,
            },
        })
    }

    public requestQuickInfo(eventContext: IEventContext): void {
        this._send({
            type: "request",
            payload: {
                name: "quick-info",
                context: eventContext,
            },
        })
    }

    public requestFormat(eventContext: IEventContext): void {
        this._send({
            type: "request",
            payload: {
                name: "format",
                context: eventContext,
            },
        })
    }

    public requestEvaluateBlock(eventContext: IEventContext, id: string, fileName: string, code: string): void {
        this._send({
            type: "request",
            payload: {
                name: "evaluate-block",
                context: eventContext,
                id,
                code,
                fileName,
            },
        })
    }

    public notifyCompletionItemSelected(completionItem: any): void {
        // TODO: Only send to plugin that sent the request
        // TODO: Factor out to common 'sendRequest' method
        this._send({
            type: "request",
            payload: {
                name: "completion-provider-item-selected",
                context: this._lastEventContext,
                item: completionItem,
            },
        })
    }

    public notifyVimEvent(eventName: string, eventContext: IEventContext): void {
        this._lastEventContext = eventContext

        this._send({
            type: "event",
            payload: {
                name: eventName,
                context: eventContext,
            },
        })
    }

    public isPluginSubscribedToVimEvents(fileType: string): boolean {
        return this.isPluginSubscribedToEventType(fileType, VimEventsSubscription)
    }

    public isPluginSubscribedToBufferUpdates(fileType: string): boolean {
        return this.isPluginSubscribedToEventType(fileType, BufferUpdateEvents)
    }

    public isPluginSubscribedToEventType(fileType: string, oniEventName: string): boolean {
        if (!this._oniPluginMetadata) {
            return false
        }

        const filePluginInfo = this._oniPluginMetadata[fileType]

        return filePluginInfo && filePluginInfo.subscriptions && filePluginInfo.subscriptions.indexOf(oniEventName) >= 0
    }

    public doesPluginProvideLanguageServiceCapability(fileType: string, capability: string): boolean {
        if (!this._oniPluginMetadata) {
            return false
        }

        const filePluginInfo = this._oniPluginMetadata[fileType]

        return filePluginInfo && filePluginInfo.languageService && filePluginInfo.languageService.indexOf(capability) >= 0
    }

    /*
    * For blocks that handle multiple languages
    * ie, javascript,typescript
    * Split into separate language srevice blocks
    */
    private _expandMultipleLanguageKeys(packageMetadata: { [languageKey: string]: any }): void {
        Object.keys(packageMetadata).forEach((key) => {
            if (key.indexOf(",")) {
                const val = packageMetadata[key]
                key.split(",").forEach((splitKey) => {
                    packageMetadata[splitKey] = val
                })
            }
        })
    }

    private _send(message: any): void {
        this._channel.host.send(message);
    }
}
