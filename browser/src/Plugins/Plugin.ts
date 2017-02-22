import * as fs from "fs"
import * as path from "path"

import * as Capabilities from "./Api/Capabilities"
import { IChannel } from "./Api/Channel"
import { Oni } from "./Api/Oni"

import * as PackageMetadataParser from "./PackageMetadataParser"

export interface IPluginCommandInfo extends Capabilities.ICommandInfo {
    command: string
}

export class Plugin {
    private _oniPluginMetadata: Capabilities.IPluginMetadata
    private _channel: IChannel
    private _commands: IPluginCommandInfo[]

    public get commands(): IPluginCommandInfo[] {
        return this._commands
    }

    constructor(
        pluginRootDirectory: string,
        channel: IChannel,
    ) {
        const packageJsonPath = path.join(pluginRootDirectory, "package.json")
        this._channel = channel

        if (fs.existsSync(packageJsonPath)) {
            this._oniPluginMetadata = PackageMetadataParser.parseFromString(fs.readFileSync(packageJsonPath, "utf8"))

            if (!this._oniPluginMetadata) {
                console.warn("Aborting plugin load, invalid package.json: " + packageJsonPath)
            } else {
                if (this._oniPluginMetadata.main) {
                    let moduleEntryPoint = path.normalize(path.join(pluginRootDirectory, this._oniPluginMetadata.main))
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

                    this._commands = PackageMetadataParser.getAllCommandsFromMetadata(this._oniPluginMetadata)
                }
            }
        }
    }
}
