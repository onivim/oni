import * as fs from "fs-extra"
import { Editor, EditorManager, Plugin } from "oni-api"
import { IEvent } from "oni-types"
import * as path from "path"

import { SidebarManager } from "../Sidebar"
import { SessionActions, SessionsPane, store } from "./"
import { getUserConfigFolderPath } from "./../../Services/Configuration/UserConfiguration"
import { getPersistentStore, IPersistentStore } from "../../PersistentStore"

export interface ISession {
    name: string
    id: string
    file: string
    directory: string
    updatedAt?: string
    workspace: string
    // can be use to save other metadata for restoration like statusbar info or sidebar info etc
    metadata?: { [key: string]: any }
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

    constructor(
        private _oni: UpdatedOni,
        private _sidebarManager: SidebarManager,
        private _persistentStore: IPersistentStore<{ [sessionName: string]: ISession }>,
    ) {
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

    public async updateOniSession(sessionName: string, value: Partial<ISession>) {
        const persistedSessions = await this._persistentStore.get()
        if (sessionName in persistedSessions) {
            this._persistentStore.set({
                ...persistedSessions,
                [sessionName]: { ...persistedSessions[sessionName], ...value },
            })
        }
    }

    public async createOniSession(sessionName: string) {
        const persistedSessions = await this._persistentStore.get()
        const file = this._getSessionFilename(sessionName)

        const session: ISession = {
            file,
            id: sessionName,
            name: sessionName,
            directory: this.sessionsDir,
            workspace: this._oni.workspace.activeWorkspace,
            metadata: null,
        }

        this._persistentStore.set({ ...persistedSessions, [sessionName]: session })

        return session
    }

    /**
     * Retrieve or Create a persistent Oni Session
     *
     * @name getSessionFromStore
     * @function
     * @param {string} sessionName The name of the session
     * @returns {ISession} The session metadata object
     */
    public async getSessionFromStore(sessionName: string) {
        const sessions = await this._persistentStore.get()
        if (sessionName in sessions) {
            return sessions[sessionName]
        }
        return this.createOniSession(sessionName)
    }

    public persistSession = async (sessionName: string) => {
        const sessionDetails = await this.getSessionFromStore(sessionName)
        await this._oni.editors.activeEditor.persistSession(sessionDetails)
        return sessionDetails
    }

    public getCurrentSession = async () => {
        const filepath = await this._oni.editors.activeEditor.getCurrentSession()
        if (!filepath) {
            return null
        }
        const [name] = path.basename(filepath).split(".")
        return filepath.includes(this._sessionsDir) ? await this.getSessionFromStore(name) : null
    }

    public restoreSession = async (sessionName: string) => {
        const sessionDetails = await this.getSessionFromStore(sessionName)
        await this._oni.editors.activeEditor.restoreSession(sessionDetails)
        const session = await this.getCurrentSession()
        return session
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
            const persistentStore = getPersistentStore("sessions", {}, 1)
            instance = new SessionManager(oni as UpdatedOni, sidebarManager, persistentStore)
        },
    }
}
export const { activate, getInstance } = init()
