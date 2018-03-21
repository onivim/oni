/**
 * PluginInstaller.ts
 *
 * Responsible for installing, updating, and uninstalling plugins.
 */

// import * as fs from "fs"
import * as path from "path"

// import * as Oni from "oni-api"

// import { Configuration, getUserConfigFolderPath } from "./../Services/Configuration"
// import { IContributions } from "./Api/Capabilities"

// import { AnonymousPlugin } from "./AnonymousPlugin"
// import { Plugin } from "./Plugin"

import Process from "./Api/Process"

/**
 * Plugin identifier:
 * - For _git_, this should be of the form `welle/targets.vim`
 * - For _npm_, this should be the name of the module, `oni-plugin-tslint`
 */
export type PluginIdentifier = string

export interface IPluginInstaller {
    install(pluginInfo: PluginIdentifier): Promise<void>

    uninstall(pluginInfo: PluginIdentifier): Promise<void>

    update(pluginInfo: PluginIdentifier): Promise<void>
}

export class YarnPluginInstaller implements IPluginInstaller {
    public async install(identifier: string): Promise<void> {
        const yarnPath = this._getYarnPath()

        Process.execNodeScript(yarnPath, ["--help"], {}, (err: any, stdout: string) => {
            alert(stdout)
        })
    }

    public async uninstall(identifier: string): Promise<void> {
        alert("uninstalled")
    }

    public async update(identifier: string): Promise<void> {
        alert("updated")
    }

    private _getYarnPath(): string {
        return path.join(__dirname, "lib", "yarn", "yarn-1.5.1.js")
    }
}
