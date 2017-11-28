import { EventEmitter } from "events"
import * as fs from "fs"
import * as path from "path"

import * as Oni from "oni-api"

import { configuration } from "./../Services/Configuration"

import { AnonymousPlugin } from "./AnonymousPlugin"
import { Plugin } from "./Plugin"

const corePluginsRoot = path.join(__dirname, "vim", "core")
const defaultPluginsRoot = path.join(__dirname, "vim", "default")

export class PluginManager extends EventEmitter {
    private _config = configuration
    private _rootPluginPaths: string[] = []
    private _plugins: Plugin[] = []
    private _anonymousPlugin: AnonymousPlugin

    public get plugins(): Plugin[] {
        return this._plugins
    }

    public discoverPlugins(): void {

        this._rootPluginPaths.push(corePluginsRoot)

        if (this._config.getValue("oni.useDefaultConfig")) {
            this._rootPluginPaths.push(defaultPluginsRoot)
            this._rootPluginPaths.push(path.join(defaultPluginsRoot, "bundle"))
        }

        this._rootPluginPaths.push(path.join(this._config.getUserFolder(), "plugins"))

        const allPluginPaths = this._getAllPluginPaths()
        this._plugins = allPluginPaths.map((pluginRootDirectory) => this._createPlugin(pluginRootDirectory))

        this._anonymousPlugin = new AnonymousPlugin()
    }

    public startApi(): Oni.Plugin.Api {

        this._plugins.forEach((plugin) => {
            plugin.activate()
        })

        return this._anonymousPlugin.oni
    }

    public getAllRuntimePaths(): string[] {
        const pluginPaths = this._getAllPluginPaths()

        return pluginPaths.concat(this._rootPluginPaths)
    }

    private _createPlugin(pluginRootDirectory: string): Plugin {
        return new Plugin(pluginRootDirectory)
    }

    private _getAllPluginPaths(): string[] {
        const paths: string[] = []
        this._rootPluginPaths.forEach((rp) => {
            const subPaths = getDirectories(rp)
            paths.push(...subPaths)
        })

        return paths
    }
}

export const pluginManager = new PluginManager()

function getDirectories(rootPath: string): string[] {
    if (!fs.existsSync(rootPath)) {
        return []
    }

    return fs.readdirSync(rootPath)
        .map((f) => path.join(rootPath.toString(), f))
        .filter((f) => fs.statSync(f).isDirectory())
}
