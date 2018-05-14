import * as chokidar from "chokidar"
import { Stats } from "fs"
import { Event, IEvent } from "oni-types"

import * as Log from "./../../Log"

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
    stats: Stats
}

export class FileSystemWatcher {
    private _watcher: chokidar.FSWatcher

    private _onAdd = new Event<IFileChangeEvent>()
    private _onAddDir = new Event<IStatsChangeEvent>()
    private _onDelete = new Event<IFileChangeEvent>()
    private _onDeleteDir = new Event<IFileChangeEvent>()
    private _onMove = new Event<IFileChangeEvent>()
    private _onChange = new Event<IFileChangeEvent>()

    constructor({ target, options }: IFSOptions) {
        this._watcher = chokidar.watch(target, options)

        this._watcher.on("ready", () => {
            this._attachEventListeners()
        })

        this._watcher.on("error", err => {
            Log.warn("FileSystemWatcher encountered an error: " + err)
        })
    }

    public watch(target: Targets) {
        return this._watcher.add(target)
    }

    public unwatch(target: Targets) {
        return this._watcher.unwatch(target)
    }

    public close() {
        this._watcher.close()
    }

    private _attachEventListeners() {
        this._watcher.on("add", path => {
            return this._onAdd.dispatch(path)
        })

        this._watcher.on("change", path => {
            return this._onChange.dispatch(path)
        })

        this._watcher.on("move", path => {
            return this._onMove.dispatch(path)
        })

        this._watcher.on("unlink", path => {
            return this._onDelete.dispatch(path)
        })

        this._watcher.on("unlinkDir", path => {
            return this._onDeleteDir.dispatch(path)
        })

        this._watcher.on("addDir", (path, stats) => {
            return this._onAddDir.dispatch({ path, stats })
        })
    }

    get allWatched(): chokidar.WatchedPaths {
        return this._watcher.getWatched()
    }

    get onChange(): IEvent<IFileChangeEvent> {
        return this._onChange
    }

    get onDelete(): IEvent<IFileChangeEvent> {
        return this._onDelete
    }

    get onDeleteDir(): IEvent<IFileChangeEvent> {
        return this._onDeleteDir
    }

    get onMove(): IEvent<IFileChangeEvent> {
        return this._onMove
    }

    get onAdd(): IEvent<IFileChangeEvent> {
        return this._onAdd
    }

    get onAddDir(): IEvent<IFileChangeEvent> {
        return this._onAddDir
    }
}
