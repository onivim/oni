import { Commands } from "oni-api"
import * as React from "react"
import { Provider } from "react-redux"

import { ISessionStore, Sessions } from "./"

interface SessionPaneProps {
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
    private _store: ISessionStore
    private _commands: Commands.Api

    constructor({ store, commands }: SessionPaneProps) {
        this._commands = commands
        this._store = store
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

    public render() {
        return (
            <Provider store={this._store}>
                <Sessions setupCommand={this._setupCommands} />
            </Provider>
        )
    }

    private _setupCommands(command: Commands.ICommand) {
        this._commands.registerCommand(command)
    }
}
