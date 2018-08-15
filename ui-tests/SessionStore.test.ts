import * as fs from "fs-extra"
import { ActionsObservable } from "redux-observable"

import * as SessionStore from "./../browser/src/Services/Sessions/SessionsStore"
import { SessionManager } from "../browser/src/Services/Sessions"

jest.mock("fs-extra")

describe("Session Store Tests", () => {
    const noop = () => ({})
    const sessionManager = {
        _store: {},
        async persistSession(sessionName: string) {
            return {
                name: sessionName,
                id: sessionName,
                file: `${sessionName}.vim`,
                directory: `session/dir/`,
                updatedAt: null,
                workspace: `/test/dir`,
            }
        },
    }

    it("should return the correct actions on persist", done => {
        const action$ = ActionsObservable.of({
            type: "PERSIST_SESSION",
            payload: { sessionName: "test-session" },
        } as SessionStore.IPersistSession)

        const expected = [
            SessionStore.SessionActions.cancelCreating(),
            SessionStore.SessionActions.persistSessionSuccess(),
            SessionStore.SessionActions.setCurrentSession({
                name: "test-session",
                id: "test-session",
                file: `test-session.vim`,
                directory: `session/dir/`,
                updatedAt: null,
                workspace: `/test/dir`,
            }),
            SessionStore.SessionActions.populateSessions(),
        ]

        SessionStore.persistSessionEpic(action$, null, {
            fs,
            sessionManager,
        })
            .toArray()
            .subscribe(actualActions => {
                setTimeout(() => {
                    expect(actualActions).toEqual(expected)
                    done()
                }, 400)
            })
    })
})
