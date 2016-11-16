import * as os from "os"
import * as path from "path"
import * as fs from "fs"

import {ipcRenderer} from "electron"

import * as Q from "q"
import * as mkdirp from "mkdirp"

import * as Config from "./../Config"
import { INeovimInstance } from "./../NeovimInstance"
import { Plugin } from "./Plugin"
import { Screen } from "./../Screen"

import * as UI from "./../UI/index"
import { OverlayManager } from "./../UI/OverlayManager"
import { ErrorOverlay } from "./../UI/Overlay/ErrorOverlay"

const initFilePath = path.join(__dirname, "vim", "init_template.vim")

const builtInPluginsRoot = path.join(__dirname, "vim", "vimfiles")

export class PluginManager {

    private _rootPluginPaths = []
    private _extensionPath: string
    private _plugins: Plugin[] = []
    private _neovimInstance: INeovimInstance
    private _overlayManager: OverlayManager

    private _errorOverlay: ErrorOverlay

    constructor(screen: Screen) {
        this._rootPluginPaths.push(builtInPluginsRoot)
        this._rootPluginPaths.push(path.join(builtInPluginsRoot, "bundle"))

        if(Config.getValue<boolean>("vim.loadVimPlugins")) {
            var userRoot = path.join(os.homedir(), "vimfiles", "bundle")

            if(fs.existsSync(userRoot)) {
                this._rootPluginPaths.push(userRoot)
            }
        }

        this._extensionPath = this._ensureOniPluginsPath()
        this._rootPluginPaths.push(this._extensionPath)

        ipcRenderer.on("cross-browser-ipc", (event, arg) => {
            console.log("cross-browser-ipc: " + JSON.stringify(arg));
            this._handlePluginResponse(arg);
        })

        this._overlayManager = new OverlayManager(screen)
        this._errorOverlay = new ErrorOverlay()
        this._overlayManager.addOverlay("errors", this._errorOverlay)
    }

    public executeCommand(command: string): void {
        this._plugins.forEach(p => p.handleCommand(command))
    }

    public handleNotification(method: string, args: any[]): void {
        if(method === "buffer_update") {
            const eventContext = args[0][0]
            const bufferLines = args[0][1]

            this._plugins.forEach((plugin) => plugin.notifyBufferUpdateEvent(eventContext, bufferLines))
        } else if(method === "event") {
            const eventName = args[0][0]
            const eventContext = args[0][1]

            this._plugins.forEach((plugin) => plugin.notifyVimEvent(eventName, eventContext))
            this._overlayManager.handleCursorMovedEvent(eventContext)
            this._errorOverlay.onVimEvent(eventName, eventContext)
        } else if(method === "window_display_update") {
            this._overlayManager.notifyWindowDimensionsChanged(args[0][1])
        }
    }

    public notifyCompletionItemSelected(completionItem: any) {
        this._plugins.forEach((plugin) => plugin.notifyCompletionItemSelected(completionItem))
    }

    private _handlePluginResponse(pluginResponse: any): void {
        if(pluginResponse.type === "show-quick-info") {
            setTimeout(() => UI.showQuickInfo(pluginResponse.payload.info, pluginResponse.payload.documentation), 50)
        } else if(pluginResponse.type === "goto-definition") {
            const { filePath, line, column } = pluginResponse.payload
            this._neovimInstance.command("e! " + filePath)
            this._neovimInstance.command("keepjumps norm " + line + "G" + column)
            this._neovimInstance.command("norm zz")
        } else if(pluginResponse.type === "completion-provider") {
            setTimeout(() => UI.showCompletions(pluginResponse.payload))
        } else if(pluginResponse.type === "completion-provider-item-selected") {
            setTimeout(() => UI.setDetailedCompletionEntry(pluginResponse.payload.details))
        } else if(pluginResponse.type === "set-errors") {
            this._errorOverlay.setErrors(pluginResponse.payload.key, pluginResponse.payload.fileName, pluginResponse.payload.errors, pluginResponse.payload.colors)
        }
    }

    public startPlugins(neovimInstance: INeovimInstance): void {
        this._neovimInstance = neovimInstance
        const allPlugins = this._getAllPluginPaths()
        this._plugins = allPlugins.map(pluginRootDirectory => new Plugin(pluginRootDirectory))
    }

    private _ensureOniPluginsPath(): string {
        var rootOniPluginsDir = path.join(os.homedir(), ".oni", "extensions")

        mkdirp.sync(rootOniPluginsDir)
        return rootOniPluginsDir
    }

    public generateInitVim(): string {
        var contents = fs.readFileSync(initFilePath, "utf8")

        const paths = this._getAllRuntimePaths()
        contents = contents.replace("${runtimepaths}" , "set rtp+=" + paths.join(","))
        var destDir = path.join(os.tmpdir(), "init.vim")
        fs.writeFileSync(destDir, contents, "utf8")

        console.log("init.vim written to: " + destDir)

        return destDir
    }

    private _getAllRuntimePaths(): string [] {
        var pluginPaths = this._getAllPluginPaths()

        return pluginPaths.concat(this._rootPluginPaths)
    }

    private _getAllPluginPaths(): string[] {

        var paths = []
        this._rootPluginPaths.forEach(rp => {
            const subPaths = getDirectories(rp)
            paths = paths.concat(subPaths)
        })

        return paths
    }
}

function getDirectories(rootPath) {
    return fs.readdirSync(rootPath)
        .map(f => path.join(rootPath, f))
        .filter(f => fs.statSync(f).isDirectory())
}
