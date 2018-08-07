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
    set(obj: { [key: string]: any }) {
        return new Promise(resolve => {
            this._store = { ...this._store, ...obj }
            resolve(null)
        })
    },
    delete(key: string) {
        this._store[key] = undefined
        return new Promise(resolve => resolve(this._store))
    },
    has(key) {
        return !!this._store[key]
    },
}

describe("Session Manager Tests", () => {
    const persistentStore = mockPersistentStore
    const oni = new Oni() as any
    const manager = new SessionManager(oni, new Sidebar(), persistentStore)

    it("Should return the correct session directory", () => {
        expect(manager.sessionsDir).toMatch(".config/oni/session")
    })

    it("should save a session in the persistentStore", async () => {
        await manager.persistSession("test-session")
        const session = await persistentStore.get()
        expect(session).toBeTruthy()
    })
})
