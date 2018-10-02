/**
 * Workspace.ts
 *
 * The 'workspace' is responsible for managing the state of the current project:
 *  - The current / active directory (and 'Open Folder')
 */

import { remote } from "electron"
import * as findup from "find-up"
import { stat } from "fs"
import * as path from "path"
import { promisify } from "util"

import "rxjs/add/observable/defer"
import "rxjs/add/observable/from"
import "rxjs/add/operator/concatMap"
import "rxjs/add/operator/toPromise"
import { Observable } from "rxjs/Observable"
import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"
import * as Log from "oni-core-logging"
import { Event, IEvent } from "oni-types"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

import { Configuration } from "./../Configuration"
import { EditorManager } from "./../EditorManager"
import { convertTextDocumentChangesToFileMap } from "./../Language/Edits"

import { WorkspaceConfiguration } from "./WorkspaceConfiguration"

const fsStat = promisify(stat)

export class Workspace implements Oni.Workspace.Api {
    private _onDirectoryChangedEvent = new Event<string>()
    private _onFocusGainedEvent = new Event<Oni.Buffer>()
    private _onFocusLostEvent = new Event<Oni.Buffer>()
    private _mainWindow = remote.getCurrentWindow()
    private _lastActiveBuffer: Oni.Buffer
    private _activeWorkspace: string

    public get activeWorkspace(): string {
        return this._activeWorkspace
    }

    constructor(private _editorManager: EditorManager, private _configuration: Configuration) {
        this._mainWindow.on("focus", () => {
            this._onFocusGainedEvent.dispatch(this._lastActiveBuffer)
        })

        this._mainWindow.on("blur", () => {
            this._lastActiveBuffer = this._editorManager.activeEditor.activeBuffer
            this._onFocusLostEvent.dispatch(this._lastActiveBuffer)
        })
    }

    public get onDirectoryChanged(): IEvent<string> {
        return this._onDirectoryChangedEvent
    }

    public async changeDirectory(newDirectory: string) {
        const exists = await this.pathIsDir(newDirectory)
        const dir = exists ? newDirectory : null
        if (newDirectory && exists) {
            process.chdir(newDirectory)
        }

        this._activeWorkspace = dir
        this._onDirectoryChangedEvent.dispatch(dir)
    }

    public async applyEdits(edits: types.WorkspaceEdit): Promise<void> {
        let editsToUse = edits
        if (edits.documentChanges) {
            editsToUse = convertTextDocumentChangesToFileMap(edits.documentChanges)
        }

        const files = Object.keys(editsToUse)

        // TODO: Show modal to grab input
        // await editorManager.activeEditor.openFiles(files)

        const deferredEdits = await files.map((fileUri: string) => {
            return Observable.defer(async () => {
                const changes = editsToUse[fileUri]
                const fileName = Helpers.unwrapFileUriPath(fileUri)
                // TODO: Sort changes?
                Log.verbose("[Workspace] Opening file: " + fileName)
                const buf = await this._editorManager.activeEditor.openFile(fileName)
                Log.verbose(
                    "[Workspace] Got buffer for file: " + buf.filePath + " and id: " + buf.id,
                )
                await buf.applyTextEdits(changes)
                Log.verbose("[Workspace] Applied " + changes.length + " edits to buffer")
            })
        })

        await Observable.from(deferredEdits)
            .concatMap(de => de)
            .toPromise()

        Log.verbose("[Workspace] Completed applying edits")

        // Hide modal
    }

    public get onFocusGained(): IEvent<Oni.Buffer> {
        return this._onFocusGainedEvent
    }

    public get onFocusLost(): IEvent<Oni.Buffer> {
        return this._onFocusLostEvent
    }

    public pathIsDir = async (p: string) => {
        try {
            const stats = await fsStat(p)
            return stats.isDirectory()
        } catch (error) {
            Log.info(error)
            return false
        }
    }

    public navigateToProjectRoot = async (bufferPath: string) => {
        const projectMarkers = this._configuration.getValue("workspace.autoDetectRootFiles")

        // If the supplied path is a folder, we should use that instead of
        // moving up a folder again.
        // Helps when calling Oni from the CLI with "oni ."
        const cwd = (await this.pathIsDir(bufferPath)) ? bufferPath : path.dirname(bufferPath)

        const filePath = await findup(projectMarkers, { cwd })
        if (filePath) {
            const projectRoot = path.dirname(filePath)
            return projectRoot !== this._activeWorkspace ? this.changeDirectory(projectRoot) : null
        }
    }

    public openFolder(): void {
        const dialogOptions: any = {
            title: "Open Folder",
            properties: ["openDirectory"],
        }

        remote.dialog.showOpenDialog(
            remote.getCurrentWindow(),
            dialogOptions,
            async (folder: string[]) => {
                if (!folder || !folder[0]) {
                    return
                }

                const folderToOpen = folder[0]
                await this.changeDirectory(folderToOpen)
            },
        )
    }

    public autoDetectWorkspace(filePath: string): void {
        const settings = this._configuration.getValue("workspace.autoDetectWorkspace")
        switch (settings) {
            case "never":
                break
            case "always":
                this.navigateToProjectRoot(filePath)
                break
            case "noworkspace":
            default:
                if (!this._activeWorkspace) {
                    this.navigateToProjectRoot(filePath)
                }
        }
    }
}

let _workspace: Workspace = null
let _workspaceConfiguration: WorkspaceConfiguration = null

export const activate = (
    configuration: Configuration,
    editorManager: EditorManager,
    workspaceToLoad?: string,
): void => {
    _workspace = new Workspace(editorManager, configuration)

    _workspaceConfiguration = new WorkspaceConfiguration(configuration, _workspace)

    const defaultWorkspace = workspaceToLoad || configuration.getValue("workspace.defaultWorkspace")

    if (defaultWorkspace) {
        _workspace.changeDirectory(defaultWorkspace)
    }

    _workspace.onDirectoryChanged.subscribe(newDirectory => {
        configuration.setValues({ "workspace.defaultWorkspace": newDirectory }, true)
    })
}

export const getInstance = (): Workspace => {
    return _workspace
}

export const getConfigurationInstance = (): WorkspaceConfiguration => {
    return _workspaceConfiguration
}
