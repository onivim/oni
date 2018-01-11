/**
 * WorkspaceConfiguration.ts
 *
 * Responsible for managing settings / loading configuration for current workspace
 */

import * as fs from "fs"
import * as path from "path"

import * as Log from "./../../Log"

import { Configuration } from "./../Configuration"
import { IWorkspace } from "./Workspace"

export const getWorkspaceConfigurationPath = (workspacePath: string): string => {
    return path.join(workspacePath, ".oni", "config.js")
}

export class WorkspaceConfiguration {

    private _activeWorkspaceConfiguration: string = null

    constructor(
        private _configuration: Configuration,
        private _workspace: IWorkspace,
        private _fs: typeof fs = fs
    ) {
        this._checkWorkspaceConfiguration()

        this._workspace.onDirectoryChanged.subscribe(() => {
            this._checkWorkspaceConfiguration()
        })
    }

    private _checkWorkspaceConfiguration(): void {

        const activeWorkspace = this._workspace.activeWorkspace

        if (!activeWorkspace) {
            return
        }

        const configurationPath = getWorkspaceConfigurationPath(activeWorkspace)

        if (this._fs.statSync(configurationPath).isFile()) {
            Log.info("[WorkspaceConfiguration] Found configuration file at: " + configurationPath)
            this._loadWorkspaceConfiguration(configurationPath)
        }
    }

    private _removePreviousWorkspaceConfiguration(): void {
        if (this._activeWorkspaceConfiguration) {
            this._configuration.removeConfigurationFile(this._activeWorkspaceConfiguration)
            this._activeWorkspaceConfiguration = null
        }
    }

    private _loadWorkspaceConfiguration(configurationPath: string): void {
        Log.info("[WorkspaceConfiguration] Loading workspace configuration from: " + configurationPath)
        this._removePreviousWorkspaceConfiguration()
        this._configuration.addConfigurationFile(configurationPath)
    }
}
