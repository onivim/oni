import "rxjs"

import * as fsExtra from "fs-extra"
import { Store } from "redux"
import { combineEpics, createEpicMiddleware, Epic } from "redux-observable"
import { fromPromise } from "rxjs/observable/fromPromise"

import { ISession, SessionManager } from "./"
import { createStore as createReduxStore } from "./../../Redux"

export interface ISessionState {
    sessions: ISession[]
    selected: ISession
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
type IRestoreSession = IGenericAction<"RESTORE_SESSION", { sessionName: string }>
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
    getAllSessions: (sessions: ISession[]) => ({
        type: "GET_ALL_SESSIONS",
        payload: { sessions },
    }),
    updateSession: (session: ISession) => ({
        type: "UPDATE_SESSION",
        payload: { session },
    }),
    cancelCreating: () => ({ type: "CANCEL_NEW_SESSION" }),
    createSession: () => ({ type: "CREATE_SESSION" }),
    restoreSession: (sessionName: string) => ({
        type: "RESTORE_SESSION",
        payload: { sessionName },
    }),
    updateSelection: (selected: string) => ({ type: "UPDATE_SELECTION", payload: { selected } }),
    populateSessions: () => ({ type: "POPULATE_SESSIONS" }),
}

type SessionEpic = Epic<ISessionActions, ISessionState, Dependencies>

const persistSessionEpic: SessionEpic = (action$, store, { sessionManager }) =>
    action$.ofType("PERSIST_SESSION").flatMap((action: IPersistSession) => {
        return fromPromise(sessionManager.persistSession(action.payload.sessionName)).flatMap(
            session => {
                return [
                    { type: "CANCEL_NEW_SESSION" } as ICancelCreateSession,
                    { type: "PERSIST_SESSION_SUCCESS" } as IPersistSessionSuccess,
                    { type: "POPULATE_SESSIONS" } as IPopulateSessions,
                ]
            },
        )
    })

// const deleteSessionEpic: Sessi

const restoreSessionEpic: SessionEpic = (action$, store, { sessionManager }) =>
    action$.ofType("RESTORE_SESSION").flatMap((action: IRestoreSession) => {
        return fromPromise(sessionManager.restoreSession(action.payload.sessionName)).mapTo({
            type: "POPULATE_SESSIONS",
        } as IPopulateSessions)
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

const findSelectedSession = (sessions: ISession[], selected: string) =>
    sessions.find(session => session.id === selected)

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
                selected: findSelectedSession(state.sessions, action.payload.selected),
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
            combineEpics(fetchSessionsEpic, persistSessionEpic, restoreSessionEpic),
            { dependencies },
        ),
    ])

export default createStore
