import { Commands } from "oni-api"
import * as React from "react"

import { ISessionService, Sessions } from "./"

interface PaneAPI extends Partial<ISessionService> {
    commands: Commands.Api
}

/**
 * Class SessionsPane
 *
 * A Side bar pane for Oni's Session Management
 *
 */
export default class SessionsPane {
    public populateExistingSessions: ISessionService["populateExistingSessions"]
    private _persistSession: ISessionService["persistSession"]
    private _restoreSession: ISessionService["restoreSession"]
    private _sessions: ISessionService["sessions"]
    private _commands: Commands.Api

    constructor({ commands, persistSession, restoreSession, populateExistingSessions }: PaneAPI) {
        this._commands = commands
        this._persistSession = persistSession
        this._restoreSession = restoreSession
        this.populateExistingSessions = populateExistingSessions

        this._setupCommands()
    }

    get id() {
        return "oni.sessions"
    }

    public get title() {
        return "Sessions"
    }

    public enter() {
        //
    }

    public leave() {
        //
    }

    public persistSession = async (name: string) => {
        await this._persistSession(name)
    }

    public restoreSession = async (name: string) => {
        await this._restoreSession(name)
    }

    public getSessions() {
        return Array.from(this._sessions.values())
    }

    public render() {
        return <Sessions populateExistingSessions={this.populateExistingSessions} />
    }

    private _setupCommands() {
        this._commands.registerCommand({
            command: "oni.sessions.persist",
            name: null,
            detail: null,
            execute: () => this._persistSession("test"),
        })
    }
}
