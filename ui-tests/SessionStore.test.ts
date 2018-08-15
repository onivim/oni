import * as SessionStore from "./../browser/src/Services/Sessions/SessionsStore"
import * as fs from "fs-extra"
jest.mock("fs-extra")
import { ActionsObservable } from "redux-observable"
import { SessionManager } from "../browser/src/Services/Sessions"

describe("Session Store Tests", () => {
    const noop = () => ({})
    const sessionManager = jest.fn<SessionManager>().mockImplementation(() => ({
        _store: {},
        persistSession(sessionName: string) {
            return {
                name: sessionName,
                id: sessionName,
                file: `${sessionName}.vim`,
                directory: `session/dir/`,
                updatedAt: null,
                workspace: `/test/dir`,
            }
        },
    }))

    it("should return the correct actions on persisting", () => {
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
            sessionManager: sessionManager as any,
        })
            .toArray()
            .subscribe(actualActions => {
                expect(actualActions).toEqual(expected)
            })
    })
})
