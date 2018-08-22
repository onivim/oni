import * as fs from "fs-extra"
import { Editor, EditorManager, Plugin } from "oni-api"
import { IEvent } from "oni-types"
import * as path from "path"

import { SidebarManager } from "../Sidebar"
import { SessionActions, SessionsPane, store } from "./"
import { getPersistentStore, IPersistentStore } from "./../../PersistentStore"
import { getUserConfigFolderPath } from "./../../Services/Configuration/UserConfiguration"

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
    private get _sessionsDir() {
        const defaultDirectory = path.join(getUserConfigFolderPath(), "sessions")
        const userDirectory = this._oni.configuration.getValue<string>(
            "experimental.sessions.directory",
        )
        const directory = userDirectory || defaultDirectory
        return directory
    }

    constructor(
        private _oni: UpdatedOni,
        private _sidebarManager: SidebarManager,
        private _persistentStore: IPersistentStore<{ [sessionName: string]: ISession }>,
    ) {
        fs.ensureDirSync(this.sessionsDir)
        const enabled = this._oni.configuration.getValue<boolean>("experimental.sessions.enabled")
        if (enabled) {
            this._sidebarManager.add(
                "save",
                new SessionsPane({ store: this._store, commands: this._oni.commands }),
            )
        }
        this._setupSubscriptions()
    }

    public get sessions() {
        return this._store.getState().sessions
    }

    public get sessionsDir() {
        return this._sessionsDir
    }

    public async updateOniSession(name: string, value: Partial<ISession>) {
        const persistedSessions = await this._persistentStore.get()
        if (name in persistedSessions) {
            this._persistentStore.set({
                ...persistedSessions,
                [name]: { ...persistedSessions[name], ...value },
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
    public async getSessionFromStore(name: string) {
        const sessions = await this._persistentStore.get()
        if (name in sessions) {
            return sessions[name]
        }
        return this.createOniSession(name)
    }

    public persistSession = async (sessionName: string) => {
        const sessionDetails = await this.getSessionFromStore(sessionName)
        await this._oni.editors.activeEditor.persistSession(sessionDetails)
        return sessionDetails
    }

    public deleteSession = async (sessionName: string) => {
        await this._persistentStore.delete(sessionName)
    }

    public getCurrentSession = async () => {
        const filepath = await this._oni.editors.activeEditor.getCurrentSession()
        if (!filepath) {
            return null
        }
        const [name] = path.basename(filepath).split(".")
        return filepath.includes(this._sessionsDir) ? this.getSessionFromStore(name) : null
    }

    public restoreSession = async (name: string) => {
        const sessionDetails = await this.getSessionFromStore(name)
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
