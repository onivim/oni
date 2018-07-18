/**
 * PluginInstaller.ts
 *
 * Responsible for installing, updating, and uninstalling plugins.
 */

import * as path from "path"

import * as Log from "oni-core-logging"
import { Event, IEvent } from "oni-types"

// import * as Oni from "oni-api"

import { getUserConfigFolderPath } from "./../Services/Configuration"
// import { IContributions } from "./Api/Capabilities"

// import { AnonymousPlugin } from "./AnonymousPlugin"
// import { Plugin } from "./Plugin"

import { IFileSystem, OniFileSystem } from "./../Services/Explorer/ExplorerFileSystem"

import Process from "./Api/Process"

/**
 * Plugin identifier:
 * - For _git_, this should be of the form `welle/targets.vim`
 * - For _npm_, this should be the name of the module, `oni-plugin-tslint`
 */
export type PluginIdentifier = string

export interface IPluginInstallerOperationEvent {
    type: "install" | "uninstall"
    identifier: string
    error?: Error
}

export interface IPluginInstaller {
    onOperationStarted: IEvent<IPluginInstallerOperationEvent>
    onOperationCompleted: IEvent<IPluginInstallerOperationEvent>
    onOperationError: IEvent<IPluginInstallerOperationEvent>

    install(pluginInfo: PluginIdentifier): Promise<void>
    uninstall(pluginInfo: PluginIdentifier): Promise<void>
}

export class YarnPluginInstaller implements IPluginInstaller {
    private _onOperationStarted = new Event<IPluginInstallerOperationEvent>(
        "PluginInstaller::onOperationStarted",
    )
    private _onOperationCompleted = new Event<IPluginInstallerOperationEvent>(
        "PluginInstaller::onOperationCompleted",
    )
    private _onOperationError = new Event<IPluginInstallerOperationEvent>(
        "PluginInstaller::onOperationError",
    )

    public get onOperationStarted(): IEvent<IPluginInstallerOperationEvent> {
        return this._onOperationStarted
    }

    public get onOperationCompleted(): IEvent<IPluginInstallerOperationEvent> {
        return this._onOperationCompleted
    }

    public get onOperationError(): IEvent<IPluginInstallerOperationEvent> {
        return this._onOperationError
    }

    constructor(private _fileSystem: IFileSystem = OniFileSystem) {}

    public async install(identifier: string): Promise<void> {
        const eventInfo: IPluginInstallerOperationEvent = {
            type: "install",
            identifier,
        }

        try {
            this._onOperationStarted.dispatch(eventInfo)
            await this._ensurePackageJsonIsCreated()
            await this._runYarnCommand("add", [identifier])
            this._onOperationCompleted.dispatch(eventInfo)
        } catch (ex) {
            this._onOperationError.dispatch({
                ...eventInfo,
                error: ex,
            })
        }
    }

    public async uninstall(identifier: string): Promise<void> {
        const eventInfo: IPluginInstallerOperationEvent = {
            type: "uninstall",
            identifier,
        }

        try {
            this._onOperationStarted.dispatch(eventInfo)
            await this._runYarnCommand("remove", [identifier])
            this._onOperationCompleted.dispatch(eventInfo)
        } catch (ex) {
            this._onOperationError.dispatch({
                ...eventInfo,
                error: ex,
            })
        }
    }

    private async _ensurePackageJsonIsCreated(): Promise<void> {
        const packageJsonFile = this._getPackageJsonFile()
        Log.info(
            `[YarnPluginInstaller::_ensurePackageJsonIsCreated] - checking file: ${packageJsonFile}`,
        )

        const doesPackageFileExist = await this._fileSystem.exists(packageJsonFile)

        if (!doesPackageFileExist) {
            Log.info(
                `[YarnPluginInstaller::_ensurePackageJsonIsCreated] - package file does not exist, initializing.`,
            )
            await this._runYarnCommand("init", ["-y"])
            Log.info(
                `[YarnPluginInstaller::_ensurePackageJsonIsCreated] - package file created successfully.`,
            )
        } else {
            Log.info(
                `[YarnPluginInstaller::_ensurePackageJsonIsCreated] - package file is available.`,
            )
        }
    }

    private async _runYarnCommand(command: string, args: string[]): Promise<void> {
        const yarnPath = this._getYarnPath()

        const workingDirectory = getUserConfigFolderPath()
        const pluginDirectory = this._getPluginsFolder()

        return new Promise<void>((resolve, reject) => {
            Process.execNodeScript(
                yarnPath,
                ["--modules-folder", pluginDirectory, "--production", "true", command, ...args],
                { cwd: workingDirectory },
                (err: any, stdout: string, stderr: string) => {
                    if (err) {
                        Log.error("Error installing: " + stderr)
                        reject(err)
                        return
                    }

                    resolve()
                },
            )
        })
    }

    private _getPackageJsonFile(): string {
        return path.join(getUserConfigFolderPath(), "package.json")
    }

    private _getPluginsFolder(): string {
        return path.join(getUserConfigFolderPath(), "plugins")
    }

    private _getYarnPath(): string {
        return path.join(__dirname, "lib", "yarn", "yarn-1.5.1.js")
    }
}
