import * as fs from "fs-extra"
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
    updatedAt: number
}

export interface ISessionService {
    sessionsDir: string
    sessions: ISession[]
    persistSession(sessionName: string): Promise<ISession>
    restoreSession(sessionName: string): Promise<ISession>
}

/**
 * Class SessionManager
 *
 * Provides a service to manage oni session i.e. buffers, screen layout etc.
 *
 */
export class SessionManager implements ISessionService {
    private _store = store({ sessionManager: this, fs })

    constructor(
        private _editorManager: EditorManager,
        private _sidebarManager: SidebarManager,
        private _commands: Commands.Api,
    ) {
        fs.ensureDirSync(this.sessionsDir)
        this._sidebarManager.add(
            "save",
            new SessionsPane({ store: this._store, commands: this._commands }),
        )
    }

    public get sessions() {
        return this._store.getState().sessions
    }

    public get sessionsDir() {
        return path.join(getUserHome(), ".config", "oni", "sessions")
    }

    public persistSession = async (sessionName: string) => {
        const sessionDetails = this._updateSession(sessionName)
        const untypedEditor: any = this._editorManager.activeEditor
        await untypedEditor.persistSession(sessionDetails)
        return sessionDetails
    }

    public restoreSession = async (sessionName: string) => {
        const sessionDetails = this._updateSession(sessionName)
        const untypedEditor: any = this._editorManager.activeEditor
        await untypedEditor.restoreSession(sessionDetails)
        return sessionDetails
    }

    public getSessionMetadata(sessionName: string, file = this._getSessionFilename(sessionName)) {
        return {
            file,
            updatedAt: Date.now(),
            name: sessionName,
            id: sessionName,
            directory: this.sessionsDir,
        }
    }

    private _getSessionFilename(name: string) {
        return path.join(this.sessionsDir, `${name}.vim`)
    }

    private _updateSession(sessionName: string) {
        const session = this.getSessionMetadata(sessionName)
        SessionActions.updateSession(session)
        return session
    }
}

function init() {
    let instance: SessionManager

    return {
        activate: (
            editorManager: EditorManager,
            sidebarManager: SidebarManager,
            commandManager: Commands.Api,
        ) => {
            instance = new SessionManager(editorManager, sidebarManager, commandManager)
        },
        getInstance: () => instance,
    }
}
export const { activate, getInstance } = init()
