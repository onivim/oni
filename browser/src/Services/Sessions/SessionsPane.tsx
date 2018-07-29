import { Commands } from "oni-api"
import * as React from "react"
import { Provider } from "react-redux"

import { ISessionService, ISessionStore, Sessions } from "./"

interface PaneAPI extends Partial<ISessionService> {
    commands: Commands.Api
    store: ISessionStore
}

/**
 * Class SessionsPane
 *
 * A Side bar pane for Oni's Session Management
 *
 */
export default class SessionsPane {
    private _persistSession: PaneAPI["persistSession"]
    private _restoreSession: PaneAPI["restoreSession"]
    private _commands: PaneAPI["commands"]
    private _store: PaneAPI["store"]

    constructor({ store, commands, persistSession, restoreSession }: PaneAPI) {
        this._commands = commands
        this._persistSession = persistSession
        this._restoreSession = restoreSession
        this._store = store

        this._setupCommands()
    }

    get id() {
        return "oni.sessions"
    }

    public get title() {
        return "Sessions"
    }

    public enter() {
        this._store.dispatch({ type: "ENTER" })
    }

    public leave() {
        this._store.dispatch({ type: "LEAVE" })
    }

    public persistSession = async (name: string) => {
        await this._persistSession(name)
    }

    public restoreSession = async (name: string) => {
        await this._restoreSession(name)
    }

    public render() {
        return (
            <Provider store={this._store}>
                <Sessions />
            </Provider>
        )
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
