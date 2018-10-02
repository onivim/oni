import * as path from "path"

import {
    ISession,
    SessionManager,
    UpdatedOni,
} from "./../browser/src/Services/Sessions/SessionManager"

import Oni from "./mocks/Oni"
import Sidebar from "./mocks/Sidebar"

jest.mock("./../browser/src/Services/Configuration/UserConfiguration", () => ({
    getUserConfigFolderPath: jest.fn().mockReturnValue("~/.config/oni"),
}))

interface IStore {
    [key: string]: ISession
}

const mockPersistentStore = {
    _store: {} as IStore,
    get(): Promise<{ [key: string]: ISession }> {
        return new Promise((resolve, reject) => {
            resolve(this._store || {})
        })
    },
    set(obj: { [key: string]: any }): Promise<void> {
        return new Promise(resolve => {
            this._store = { ...this._store, ...obj }
            resolve()
        })
    },
    delete(key: string): Promise<any> {
        delete this._store[key]
        return new Promise(resolve => resolve(this._store))
    },
    has(key: string) {
        return !!this._store[key]
    },
}

describe("Session Manager Tests", () => {
    const persistentStore = mockPersistentStore
    const oni = new Oni({})
    const manager = new SessionManager(oni as UpdatedOni, new Sidebar(), persistentStore)

    beforeEach(() => {
        mockPersistentStore._store = {}
    })

    it("Should return the correct session directory", () => {
        expect(manager.sessionsDir).toMatch(path.join(".config", "oni", "session"))
    })

    it("should save a session in the persistentStore", async () => {
        await manager.persistSession("test-session")
        const session = await persistentStore.get()
        expect(session).toBeTruthy()
    })

    it("should correctly delete a session", async () => {
        await manager.persistSession("test-session")
        const session = await persistentStore.get()
        expect(session).toBeTruthy()
        await manager.deleteSession("test-session")
        expect(session["test-session"]).toBeFalsy()
    })

    it("should correctly update a session", async () => {
        await manager.persistSession("test-session")
        await manager.updateOniSession("test-session", { newValue: 2 } as any)
        const session: any = await manager.getSessionFromStore("test-session")
        expect(session.newValue).toBe(2)
    })
})
