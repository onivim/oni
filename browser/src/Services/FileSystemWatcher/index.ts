import * as chokidar from "chokidar"
import { Event, IEvent } from "oni-types"

import * as Workspace from "./../Workspace"

export type Targets = string | string[]

interface IFSOptions {
    options?: chokidar.WatchOptions
    target?: Targets
}

interface IFileChangeEvent {
    path: string
}

interface IStatsChangeEvent {
    path: string
    stats: any
}

export class FileSystemWatcher {
    private _watcher: chokidar.FSWatcher
    private _workspace: Workspace.Workspace
    private _activeWorkspace: string

    private _onAdd = new Event<IFileChangeEvent>()
    private _onAddDir = new Event<IStatsChangeEvent>()
    private _onMove = new Event<IFileChangeEvent>()
    private _onChange = new Event<IFileChangeEvent>()
    private _defaultOptions = { ignored: "**/node_modules", ignoreInitial: true }

    constructor(watch: IFSOptions = {}) {
        this._workspace = Workspace.getInstance()
        this._activeWorkspace = this._workspace.activeWorkspace
        const fileOrFolder = watch.target || this._activeWorkspace
        const optionsToUse = watch.options || this._defaultOptions
        this._watcher = chokidar.watch(fileOrFolder, optionsToUse)
        this._attachEventListeners()
    }

    public watch(target: string | string[]) {
        return this._watcher.add(target)
    }

    public unwatch(target: string | string[]) {
        return this._watcher.unwatch(target)
    }

    public close() {
        this._watcher.close()
    }

    private _attachEventListeners(dir?: boolean) {
        this._watcher.on("add", path => {
            return this._onAdd.dispatch(path)
        })

        this._watcher.on("change", path => {
            return this._onChange.dispatch(path)
        })

        this._watcher.on("move", path => {
            return this._onMove.dispatch(path)
        })

        if (dir) {
            this._watcher.on("addDir", (path, stats) => {
                return this._onAddDir.dispatch({ path, stats })
            })
        }
    }

    get allWatched(): chokidar.WatchedPaths {
        return this._watcher.getWatched()
    }

    get onChange(): IEvent<IFileChangeEvent> {
        return this._onChange
    }

    get onMove(): IEvent<IFileChangeEvent> {
        return this._onMove
    }

    get onAdd(): IEvent<IFileChangeEvent> {
        return this._onAdd
    }

    get addDir(): IEvent<IStatsChangeEvent> {
        return this._onAddDir
    }
}

export default new FileSystemWatcher()
