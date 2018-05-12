import * as fs from "fs"
import * as path from "path"

import * as Oni from "oni-api"

import { Configuration, getUserConfigFolderPath } from "./../Services/Configuration"
import { IContributions } from "./Api/Capabilities"

import { AnonymousPlugin } from "./AnonymousPlugin"
import { Plugin } from "./Plugin"

const corePluginsRoot = path.join(__dirname, "vim", "core")
const defaultPluginsRoot = path.join(__dirname, "vim", "default")
const extensionsRoot = path.join(__dirname, "extensions")

import { flatMap } from "./../Utility"

import { IPluginInstaller, YarnPluginInstaller } from "./PluginInstaller"

export class PluginManager implements Oni.IPluginManager {
    private _rootPluginPaths: string[] = []
    private _plugins: Plugin[] = []
    private _anonymousPlugin: AnonymousPlugin
    private _pluginsActivated: boolean = false
    private _installer: IPluginInstaller = new YarnPluginInstaller()

    private _developmentPluginsPath: string[] = []

    public get plugins(): Plugin[] {
        return this._plugins
    }

    public get installer(): IPluginInstaller {
        return this._installer
    }

    constructor(private _config: Configuration) {}

    public addDevelopmentPlugin(pluginPath: string): void {
       this._developmentPluginsPath.push(pluginPath)
    }

    public discoverPlugins(): void {
        const corePluginRootPaths: string[] = [corePluginsRoot, extensionsRoot]
        const corePlugins: Plugin[] = this._getAllPluginPaths(corePluginRootPaths).map(p =>
            this._createPlugin(p, "core"),
        )

        let defaultPluginRootPaths: string[] = []
        let defaultPlugins: Plugin[] = []
        if (this._config.getValue("oni.useDefaultConfig")) {
            defaultPluginRootPaths = [defaultPluginsRoot, path.join(defaultPluginsRoot, "bundle")]

            defaultPlugins = this._getAllPluginPaths(defaultPluginRootPaths).map(p =>
                this._createPlugin(p, "default"),
            )
        }

        const userPluginsRootPath = [path.join(getUserConfigFolderPath(), "plugins")]
        const userPlugins = this._getAllPluginPaths(userPluginsRootPath).map(p =>
            this._createPlugin(p, "user"),
        )

        const developmentPlugins = this._developmentPluginsPath.map((dev) => this._createPlugin(dev, "development"))

        this._rootPluginPaths = [
            ...corePluginRootPaths,
            ...defaultPluginRootPaths,
            ...userPluginsRootPath,
        ]
        this._plugins = [...corePlugins, ...defaultPlugins, ...userPlugins, ...developmentPlugins]

        this._anonymousPlugin = new AnonymousPlugin()
    }

    public startApi(): Oni.Plugin.Api {
        this._plugins.forEach(plugin => {
            plugin.activate()
        })

        this._pluginsActivated = true

        return this._anonymousPlugin.oni
    }

    public getAllRuntimePaths(): string[] {
        const pluginPaths = [...this._getAllPluginPaths(this._rootPluginPaths), ...this._developmentPluginsPath]

        return pluginPaths.concat(this._rootPluginPaths)
    }

    public get loaded(): boolean {
        return this._pluginsActivated
    }

    public getPlugin(name: string): any {
        for (const plugin of this._plugins) {
            if (plugin.name === name) {
                return plugin.instance
            }
        }
        return null
    }

    public getAllContributionsOfType<T>(selector: (capabilities: IContributions) => T[]): T[] {
        const filteredPlugins = this.plugins.filter(p => p.metadata && p.metadata.contributes)
        const capabilities = flatMap(
            filteredPlugins,
            p => selector(p.metadata.contributes) || ([] as T[]),
        )
        return capabilities
    }

    private _createPlugin(pluginRootDirectory: string, source: string): Plugin {
        return new Plugin(pluginRootDirectory, source)
    }

    private _getAllPluginPaths(rootPluginPaths: string[]): string[] {
        const paths: string[] = []
        rootPluginPaths.forEach(rp => {
            const subPaths = getDirectories(rp)
            paths.push(...subPaths)
        })

        return paths
    }
}

let _pluginManager: PluginManager = null

export const activate = (configuration: Configuration): void => {
    _pluginManager = new PluginManager(configuration)
}

export const getInstance = (): PluginManager => _pluginManager

function getDirectories(rootPath: string): string[] {
    if (!fs.existsSync(rootPath)) {
        return []
    }

    return fs
        .readdirSync(rootPath)
        .map(f => path.join(rootPath.toString(), f))
        .filter(f => fs.statSync(f).isDirectory())
}
