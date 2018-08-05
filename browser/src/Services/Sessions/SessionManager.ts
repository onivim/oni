import * as fs from "fs-extra"
import { Editor, EditorManager, Plugin } from "oni-api"
import { IEvent } from "oni-types"
import * as path from "path"

import { SidebarManager } from "../Sidebar"
import { SessionActions, SessionsPane, store } from "./"
import { getUserConfigFolderPath } from "./../../Services/Configuration/UserConfiguration"

export interface ISession {
    name: string
    id: string
    file: string
    directory: string
    updatedAt: number
    workspace: string
}

export interface ISessionService {
    sessionsDir: string
    sessions: ISession[]
    persistSession(sessionName: string): Promise<ISession>
    restoreSession(sessionName: string): Promise<ISession>
}

export interface UpdatedOni extends Plugin.Api {
    editors: UpdatedEditorManager
}

interface UpdatedEditorManager extends EditorManager {
    activeEditor: UpdatedEditor
}

interface UpdatedEditor extends Editor {
    onQuit: IEvent<void>
    persistSession(sessionDetails: ISession): Promise<ISession>
    restoreSession(sessionDetails: ISession): Promise<ISession>
    getCurrentSession(): Promise<string | void>
}

/**
 * Class SessionManager
 *
 * Provides a service to manage oni session i.e. buffers, screen layout etc.
 *
 */
export class SessionManager implements ISessionService {
    private _store = store({ sessionManager: this, fs })
    private _sessionsDir = path.join(getUserConfigFolderPath(), "sessions")

    constructor(private _oni: UpdatedOni, private _sidebarManager: SidebarManager) {
        fs.ensureDirSync(this.sessionsDir)
        this._sidebarManager.add(
            "save",
            new SessionsPane({ store: this._store, commands: this._oni.commands }),
        )
        this._setupSubscriptions()
    }

    public get sessions() {
        return this._store.getState().sessions
    }

    public get sessionsDir() {
        return this._sessionsDir
    }

    public persistSession = async (sessionName: string) => {
        const sessionDetails = this.getSessionMetadata(sessionName)
        await this._oni.editors.activeEditor.persistSession(sessionDetails)
        return sessionDetails
    }

    public getCurrentSession = async () => {
        const filepath = await this._oni.editors.activeEditor.getCurrentSession()
        if (!filepath) {
            return null
        }
        const [name] = path.basename(filepath).split(".")
        return filepath.includes(this._sessionsDir) ? this.getSessionMetadata(name, filepath) : null
    }

    public restoreSession = async (sessionName: string) => {
        const sessionDetails = this.getSessionMetadata(sessionName)
        await this._oni.editors.activeEditor.restoreSession(sessionDetails)
        const session = await this.getCurrentSession()
        return session
    }

    public getSessionMetadata(sessionName: string, file = this._getSessionFilename(sessionName)) {
        return {
            file,
            id: sessionName,
            name: sessionName,
            updatedAt: Date.now(),
            directory: this.sessionsDir,
            workspace: this._oni.workspace.activeWorkspace,
        }
    }

    private _getSessionFilename(name: string) {
        return path.join(this.sessionsDir, `${name}.vim`)
    }

    private _setupSubscriptions() {
        this._oni.editors.activeEditor.onBufferEnter.subscribe(() => {
            this._store.dispatch(SessionActions.updateCurrentSession())
        })
        this._oni.editors.activeEditor.onQuit.subscribe(() => {
            this._store.dispatch(SessionActions.updateCurrentSession())
        })
    }
}

function init() {
    let instance: SessionManager
    return {
        getInstance: () => instance,
        activate: (oni: Plugin.Api, sidebarManager: SidebarManager) => {
            instance = new SessionManager(oni as UpdatedOni, sidebarManager)
        },
    }
}
export const { activate, getInstance } = init()
