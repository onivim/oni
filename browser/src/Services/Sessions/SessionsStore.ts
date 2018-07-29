import "rxjs"

import * as fsExtra from "fs-extra"
import { Store } from "redux"
import { combineEpics, createEpicMiddleware, Epic } from "redux-observable"
import { fromPromise } from "rxjs/observable/fromPromise"

import { ISession, SessionManager } from "./"
import { createStore as createReduxStore } from "./../../Redux"

export interface ISessionState {
    sessions: ISession[]
    selected: string
    active: boolean
    creating: boolean
}

const DefaultState: ISessionState = {
    sessions: [],
    selected: null,
    active: false,
    creating: false,
}

interface IGenericAction<N, T = undefined> {
    type: N
    payload?: T
}

export type ISessionStore = Store<ISessionState>

type IUpdateMultipleSessions = IGenericAction<"GET_ALL_SESSIONS", { sessions: ISession[] }>
type IUpdateSelection = IGenericAction<"UPDATE_SELECTION", { selected: string }>
type IRestoreSession = IGenericAction<"RESTORE_SESSION", { selected: string }>
type IPersistSession = IGenericAction<"PERSIST_SESSION", { sessionName: string }>
type IPersistSessionSuccess = IGenericAction<"PERSIST_SESSION_SUCCESS">
type IUpdateSession = IGenericAction<"UPDATE_SESSION", { session: ISession }>
type IPopulateSessions = IGenericAction<"POPULATE_SESSIONS">
type ICreateSession = IGenericAction<"CREATE_SESSION">
type ICancelCreateSession = IGenericAction<"CANCEL_NEW_SESSION">
type IEnter = IGenericAction<"ENTER">
type ILeave = IGenericAction<"LEAVE">

export type ISessionActions =
    | IUpdateMultipleSessions
    | ICancelCreateSession
    | IUpdateSession
    | IPopulateSessions
    | IUpdateSelection
    | IPersistSession
    | IPersistSessionSuccess
    | IRestoreSession
    | ICreateSession
    | IEnter
    | ILeave

export const SessionActions = {
    persistSession: (sessionName: string) => ({
        type: "PERSIST_SESSION",
        payload: { sessionName },
    }),
    cancelCreating: () => ({ type: "CANCEL_NEW_SESSION" }),
    createSession: () => ({ type: "CREATE_SESSION" }),
    restoreSession: (selected: string) => ({ type: "RESTORE_SESSION", payload: { selected } }),
    updateSelection: (selected: string) => ({ type: "UPDATE_SELECTION", payload: { selected } }),
    populateSessions: () => ({ type: "POPULATE_SESSIONS" }),
    getAllSessions: (sessions: ISession[]) => ({
        type: "GET_ALL_SESSIONS",
        payload: { sessions },
    }),
    updateSession: (session: ISession) => ({
        type: "UPDATE_SESSION",
        payload: { session },
    }),
}

type SessionEpic = Epic<ISessionActions, ISessionState, Dependencies>

const persistSessionEpic: SessionEpic = (action$, store, { sessionManager }) =>
    action$.ofType("PERSIST_SESSION").flatMap((action: IPersistSession) => {
        return fromPromise(sessionManager.persistSession(action.payload.sessionName)).flatMap(
            session => {
                return [{ type: "PERSIST_SESSION_SUCCESS" } as IPersistSessionSuccess]
            },
        )
    })

const fetchSessionsEpic: SessionEpic = (action$, store, { fs, sessionManager }) =>
    action$.ofType("POPULATE_SESSIONS").flatMap((action: IPopulateSessions) => {
        return fromPromise(fs.readdir(sessionManager.sessionsDir)).flatMap(dir => {
            const metadata = dir.map(file => {
                const [name] = file.split(".")
                return { name, file }
            })
            const sessions = metadata.map(({ file, name }) =>
                sessionManager.getSessionMetadata(name, file),
            )
            return [
                {
                    type: "GET_ALL_SESSIONS",
                    payload: { sessions },
                } as IUpdateMultipleSessions,
            ]
        })
    })

function reducer(state: ISessionState, action: ISessionActions) {
    switch (action.type) {
        case "UPDATE_SESSION":
            return {
                ...state,
                sessions: [...state.sessions, action.payload.session],
            }
        case "GET_ALL_SESSIONS":
            return {
                ...state,
                sessions: action.payload.sessions,
            }
        case "CREATE_SESSION":
            return {
                ...state,
                creating: true,
            }
        case "CANCEL_NEW_SESSION":
            return {
                ...state,
                creating: false,
            }
        case "ENTER":
            return {
                ...state,
                active: true,
            }
        case "LEAVE":
            return {
                ...state,
                active: false,
            }
        case "UPDATE_SELECTION":
            return {
                ...state,
                selected: action.payload.selected,
            }
        default:
            return state
    }
}

interface Dependencies {
    fs: typeof fsExtra
    sessionManager: SessionManager
}

const createStore = (dependencies: Dependencies) =>
    createReduxStore("sessions", reducer, DefaultState, [
        createEpicMiddleware<ISessionActions, ISessionState, Dependencies>(
            combineEpics(fetchSessionsEpic, persistSessionEpic),
            { dependencies },
        ),
    ])

export default createStore
