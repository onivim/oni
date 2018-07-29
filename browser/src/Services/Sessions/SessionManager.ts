import { ensureDirSync, readdir } from "fs-extra"
import { Commands, EditorManager } from "oni-api"
import * as path from "path"

import { SidebarManager } from "../Sidebar"
import { SessionActions, SessionsPane, store } from "./"
import { getUserHome } from "./../../Platform"

export interface ISession {
    name: string
    id: string
    file: string
    directory: string
}

export interface ISessionService {
    sessionsDir: string
    sessions: ISession[]
    persistSession(sessionName: string): Promise<void>
    restoreSession(sessionName: string): Promise<ISession>
    populateExistingSessions(): Promise<void>
}

/**
 * Class SessionManager
 *
 * Provides a service to manage oni session i.e. buffers, screen layout etc.
 *
 */
export class SessionManager implements ISessionService {
    private _store = store

    constructor(
        private _editorManager: EditorManager,
        private _sidebarManager: SidebarManager,
        private _commands: Commands.Api,
    ) {
        ensureDirSync(this.sessionsDir)
        this._sidebarManager.add(
            "archive",
            new SessionsPane({
                commands: this._commands,
                persistSession: this.persistSession,
                restoreSession: this.restoreSession,
                populateExistingSessions: this.populateExistingSessions,
            }),
        )
    }

    public get sessions() {
        return this._store.getState().sessions
    }

    public get sessionsDir() {
        return path.join(getUserHome(), ".config", "oni", "sessions")
    }

    public populateExistingSessions = async () => {
        const dir = await readdir(this.sessionsDir)
        const names = dir.map(file => {
            const [name] = file.split(".")
            return { name, file }
        })
        this._updateSessions(names)
    }

    public persistSession = async (sessionName: string) => {
        const sessionDetails = this._updateSession(sessionName)
        await (this._editorManager.activeEditor as any).persistSession(sessionDetails)
    }

    public restoreSession = async (sessionName: string) => {
        const sessionDetails = this._updateSession(sessionName)
        await (this._editorManager.activeEditor as any).restoreSession(sessionDetails)
        return sessionDetails
    }

    private _getSessionFilename(name: string) {
        return path.join(this.sessionsDir, `${name}.vim`)
    }

    private _updateSessions = (metadata: Array<Partial<ISession>>) => {
        const sessions = metadata.map(session =>
            this._getSessionMetadata(session.name, session.file),
        )
        SessionActions.updateSessions(sessions)
    }

    private _updateSession(sessionName: string) {
        const session = this._getSessionMetadata(sessionName)
        SessionActions.updateSession(session)
        return session
    }

    private _getSessionMetadata(sessionName: string, file = this._getSessionFilename(sessionName)) {
        return {
            file,
            name: sessionName,
            id: sessionName,
            directory: this.sessionsDir,
        }
    }
}

function init() {
    let instance: SessionManager

    return {
        getInstance: () => instance,
        activate: (
            editorManager: EditorManager,
            sidebarManager: SidebarManager,
            commandManager: Commands.Api,
        ) => {
            instance = new SessionManager(editorManager, sidebarManager, commandManager)
        },
    }
}
export const { activate, getInstance } = init()
