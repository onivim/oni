import * as path from "path"
import * as fs from "fs"

const BrowserWindow = require("electron").remote.BrowserWindow

export interface PluginMetadata {
    debugging: boolean;
}

const DefaultMetadata: PluginMetadata = {
    debugging: false
}

// Subscription Events
const VimEventsSubscription = "vim-events"
const BufferUpdateEvents = "buffer-update"

// Language Service Capabilities
const QuickInfoCapability = "quick-info"
const GotoDefinitionCapability = "goto-definition"
const CompletionProviderCapability = "completion-provider"

export interface EventContext {
    bufferFullPath: string
    line: number
    column: number
    byte: number
    filetype: string
}

export class Plugin {


    private _packageMetadata: any;
    private _oniPluginMetadata: PluginMetadata;
    private _browserWindow: Electron.BrowserWindow;
    private _browserWindowId: number;
    private _webContents: any;
    private _lastEventContext: EventContext;

    public get browserWindow(): Electron.BrowserWindow {
        return this._browserWindow;
    }

    private _send(message: any) {

        if(!this.browserWindow)
            return

        const messageToSend = Object.assign({}, message, {
            meta: {
                senderId: 1, // TODO
                destinationId: this._browserWindowId
            }
        })

        this._webContents.send("cross-browser-ipc", message)
    }

    public handleCommand(command: string): void {

        if(!this._lastEventContext)
            return

        const eventContext = this._lastEventContext

        if(command === "editor.gotoDefinition"
            && this._doesPluginProvideLanguageServiceCapability(eventContext.filetype, GotoDefinitionCapability)) {
                this._send({
                    type: "request",
                    payload: {
                        name: "goto-definition",
                        context: eventContext
                    }
                })
            }
    }

    public notifyBufferUpdateEvent(eventContext: EventContext, bufferLines: string[]): void {
        if (!this._isPluginSubscribedToBufferUpdates(eventContext.filetype))
            return;

        this._send({
            type: "buffer-update",
            payload: {
                eventContext: eventContext,
                bufferLines: bufferLines
            }
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
                item: completionItem
            }
        })
    }

    public notifyVimEvent(eventName: string, eventContext: EventContext): void {

        this._lastEventContext = eventContext

        if (!this._isPluginSubscribedToVimEvents(eventContext.filetype))
            return;

        this._send({
            type: "event",
            payload: {
                name: eventName,
                context: eventContext
            }
        });

        if (eventName === "CursorMoved" && this._doesPluginProvideLanguageServiceCapability(eventContext.filetype, QuickInfoCapability)) {
            this._send({
                type: "request",
                payload: {
                    name: "quick-info",
                    context: eventContext
                }
            });
        }
        else if(eventName === "CursorMovedI" && this._doesPluginProvideLanguageServiceCapability(eventContext.filetype, CompletionProviderCapability)) {
            this._send({
                type: "request",
                payload: {
                    name: "completion-provider",
                    context: eventContext
                }
            })
        }
    }

    private _isPluginSubscribedToVimEvents(fileType: string): boolean {
        return this._isPluginSubscribedToEventType(fileType, VimEventsSubscription);
    }

    private _isPluginSubscribedToBufferUpdates(fileType: string): boolean {
        return this._isPluginSubscribedToEventType(fileType, BufferUpdateEvents);
    }

    private _isPluginSubscribedToEventType(fileType: string, oniEventName: string): boolean {
        if (!this._oniPluginMetadata)
            return false;

        const filePluginInfo = this._oniPluginMetadata[fileType];

        return filePluginInfo && filePluginInfo.subscriptions && filePluginInfo.subscriptions.indexOf(oniEventName) >= 0;
    }

    private _doesPluginProvideLanguageServiceCapability(fileType: string, capability: string): boolean {
        if (!this._oniPluginMetadata)
            return false;

        const filePluginInfo = this._oniPluginMetadata[fileType] || this._oniPluginMetadata["*"];

        return filePluginInfo && filePluginInfo.languageService && filePluginInfo.languageService.indexOf(capability) >= 0;
    }

    constructor(pluginRootDirectory: string) {
        var packageJsonPath = path.join(pluginRootDirectory, "package.json")

        if(fs.existsSync(packageJsonPath)) {
            this._packageMetadata = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))

            const engines = this._packageMetadata.engines;

            // TODO: Handle oni engine version
            if(!engines || !engines["oni"]) {
                console.warn("Aborting plugin load as Oni engine version not specified: " + packageJsonPath);
            } else {
                if(this._packageMetadata.main) {
                    var moduleEntryPoint = path.join(pluginRootDirectory, this._packageMetadata.main)
                    this._browserWindow = loadPluginInBrowser(moduleEntryPoint, null)
                    this._browserWindowId = this._browserWindow.id
                    this._webContents = this._browserWindow.webContents
                }

                const pluginMetadata = this._packageMetadata.oni || {}

                this._expandMultipleLanguageKeys(pluginMetadata)

                this._oniPluginMetadata = Object.assign({}, DefaultMetadata, pluginMetadata)

                if(this._oniPluginMetadata.debugging) {
                    (<any>this._browserWindow).openDevTools()
                    this._browserWindow.show()
                }
            }
        }
    }

    /* 
    * For blocks that handle multiple languages
    * ie, javascript,typescript
    * Split into separate language srevice blocks
    */
    private _expandMultipleLanguageKeys(packageMetadata: {[languageKey:string]: any}) {
        Object.keys(packageMetadata).forEach(key => {
            if(key.indexOf(",")) {
                const val = packageMetadata[key]
                key.split(",").forEach(splitKey => {
                    packageMetadata[splitKey] = val
                })
            }
        })
    }
}

const loadPluginInBrowser = (pathToModule: string, apiObject: any) => {
    var browserWindow = new BrowserWindow({width: 800, height: 600, show: false, webPreferences: { webSecurity: false }});

    browserWindow.webContents.on("did-finish-load", () => {
        browserWindow.webContents.send("init", {
            pathToModule: pathToModule
        })
    });

    const url = "file://" + path.join(__dirname, "browser", "src", "Plugins", "plugin_host.html");
    browserWindow.loadURL(url);
    return browserWindow;
}
