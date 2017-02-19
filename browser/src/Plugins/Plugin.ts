import * as fs from "fs"
import * as path from "path"

import * as Capabilities from "./Api/Capabilities"
import { IChannel } from "./Api/Channel"
import { Oni } from "./Api/Oni"

import * as PackageMetadataParser from "./PackageMetadataParser"


// TODO: Remove htis

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

export class Plugin {
    private _packageMetadata: any
    private _oniPluginMetadata: Capabilities.IPluginMetadata
    private _lastEventContext: IEventContext

    private _channel: IChannel

    constructor(pluginRootDirectory: string, channel: IChannel) {
        const packageJsonPath = path.join(pluginRootDirectory, "package.json")
        this._channel = channel

        if (fs.existsSync(packageJsonPath)) {
            this._oniPluginMetadata = PackageMetadataParser.parseFromString(fs.readFileSync(packageJsonPath, "utf8"))

            if (!this._oniPluginMetadata) { 
                console.warn("Aborting plugin load, invalid package.json: " + packageJsonPath)
            } else {
                if (this._packageMetadata.main) {
                    let moduleEntryPoint = path.normalize(path.join(pluginRootDirectory, this._packageMetadata.main))
                    moduleEntryPoint = moduleEntryPoint.split("\\").join("/")

                    const vm = require("vm")

                    try {
                        vm.runInNewContext(`debugger; require('${moduleEntryPoint}').activate(Oni); `, {
                            Oni: new Oni(this._channel.createPluginChannel(this._oniPluginMetadata)),
                            require: window["require"], // tslint:disable-line no-string-literal
                            console,
                        })
                    } catch (ex) {
                        console.error(`Failed to load plugin at ${pluginRootDirectory}: ${ex}`)
                    }
                }
            }
        }
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

    private _send(message: any): void {
        this._channel.host.send(message, null)
    }
}
