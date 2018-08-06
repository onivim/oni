import "rxjs"

import * as fsExtra from "fs-extra"
import * as path from "path"
import { Store } from "redux"
import { combineEpics, createEpicMiddleware, Epic, ofType } from "redux-observable"
import { from } from "rxjs/observable/from"
import { auditTime, catchError, filter, flatMap } from "rxjs/operators"

import { ISession, SessionManager } from "./"
import { createStore as createReduxStore } from "./../../Redux"

export interface ISessionState {
    sessions: ISession[]
    selected: ISession
    currentSession: ISession
    active: boolean
    creating: boolean
}

const DefaultState: ISessionState = {
    sessions: [],
    selected: null,
    active: false,
    creating: false,
    currentSession: null,
}

interface IGenericAction<N, T = undefined> {
    type: N
    payload?: T
}

export type ISessionStore = Store<ISessionState>

type IUpdateMultipleSessions = IGenericAction<"GET_ALL_SESSIONS", { sessions: ISession[] }>
type IUpdateSelection = IGenericAction<"UPDATE_SELECTION", { selected: string }>
type IUpdateSession = IGenericAction<"UPDATE_SESSION", { session: ISession }>
type IRestoreSession = IGenericAction<"RESTORE_SESSION", { sessionName: string }>
type IPersistSession = IGenericAction<"PERSIST_SESSION", { sessionName: string }>
type IPersistSessionSuccess = IGenericAction<"PERSIST_SESSION_SUCCESS">
type IPersistSessionFailed = IGenericAction<"PERSIST_SESSION_FAILED", { error: Error }>
type IRestoreSessionError = IGenericAction<"RESTORE_SESSION_ERROR", { error: Error }>
type IDeleteSession = IGenericAction<"DELETE_SESSION">
type IDeleteSessionSuccess = IGenericAction<"DELETE_SESSION_SUCCESS">
type IDeleteSessionFailed = IGenericAction<"DELETE_SESSION_FAILED">
type IUpdateCurrentSession = IGenericAction<"UPDATE_CURRENT_SESSION">
type ISetCurrentSession = IGenericAction<"SET_CURRENT_SESSION", { session: ISession }>
type IPopulateSessions = IGenericAction<"POPULATE_SESSIONS">
type ICreateSession = IGenericAction<"CREATE_SESSION">
type ICancelCreateSession = IGenericAction<"CANCEL_NEW_SESSION">
type IEnter = IGenericAction<"ENTER">
type ILeave = IGenericAction<"LEAVE">

export type ISessionActions =
    | IUpdateMultipleSessions
    | ICancelCreateSession
    | IRestoreSessionError
    | IUpdateCurrentSession
    | IPopulateSessions
    | IUpdateSelection
    | IUpdateSession
    | IPersistSession
    | IPersistSessionSuccess
    | IPersistSessionFailed
    | IDeleteSession
    | IDeleteSessionSuccess
    | IDeleteSessionFailed
    | IRestoreSession
    | ISetCurrentSession
    | ICreateSession
    | IEnter
    | ILeave

export const SessionActions = {
    persistSessionSuccess: () => ({ type: "PERSIST_SESSION_SUCCESS" } as IPersistSessionSuccess),
    populateSessions: () => ({ type: "POPULATE_SESSIONS" } as IPopulateSessions),
    deleteSession: () => ({ type: "DELETE_SESSION" } as IDeleteSession),
    cancelCreating: () => ({ type: "CANCEL_NEW_SESSION" } as ICancelCreateSession),
    createSession: () => ({ type: "CREATE_SESSION" } as ICreateSession),
    updateCurrentSession: () => ({ type: "UPDATE_CURRENT_SESSION" } as IUpdateCurrentSession),
    deleteSessionSuccess: () => ({ type: "DELETE_SESSION_SUCCESS" } as IDeleteSessionSuccess),

    updateSession: (session: ISession) => ({ type: "UPDATE_SESSION", session } as IUpdateSession),
    setCurrentSession: (session: ISession) =>
        ({ type: "SET_CURRENT_SESSION", payload: { session } } as ISetCurrentSession),

    deleteSessionFailed: (error: Error) =>
        ({ type: "DELETE_SESSION_FAILED", error } as IDeleteSessionFailed),

    persistSessionFailed: (error: Error) =>
        ({ type: "PERSIST_SESSION_FAILED", error } as IPersistSessionFailed),

    updateSelection: (selected: string) =>
        ({ type: "UPDATE_SELECTION", payload: { selected } } as IUpdateSelection),

    getAllSessions: (sessions: ISession[]) =>
        ({
            type: "GET_ALL_SESSIONS",
            payload: { sessions },
        } as IUpdateMultipleSessions),

    persistSession: (sessionName: string) =>
        ({
            type: "PERSIST_SESSION",
            payload: { sessionName },
        } as IPersistSession),

    restoreSessionError: (error: Error) =>
        ({
            type: "RESTORE_SESSION_ERROR",
            payload: { error },
        } as IRestoreSessionError),

    restoreSession: (sessionName: string) =>
        ({
            type: "RESTORE_SESSION",
            payload: { sessionName },
        } as IRestoreSession),
}

type SessionEpic = Epic<ISessionActions, ISessionState, Dependencies>

const persistSessionEpic: SessionEpic = (action$, store, { sessionManager }) =>
    action$.pipe(
        ofType("PERSIST_SESSION"),
        auditTime(200),
        flatMap((action: IPersistSession) => {
            return from(sessionManager.persistSession(action.payload.sessionName)).pipe(
                flatMap(session => {
                    return [
                        SessionActions.cancelCreating(),
                        SessionActions.persistSessionSuccess(),
                        SessionActions.setCurrentSession(session),
                        SessionActions.populateSessions(),
                    ]
                }),
                catchError(error => [SessionActions.persistSessionFailed(error)]),
            )
        }),
    )

const updateCurrentSessionEpic: SessionEpic = (action$, store, { fs, sessionManager }) => {
    return action$.pipe(
        ofType("UPDATE_CURRENT_SESSION"),
        auditTime(200),
        flatMap(() =>
            from(sessionManager.getCurrentSession()).pipe(
                filter(session => !!session),
                flatMap(currentSession => [SessionActions.persistSession(currentSession.name)]),
                catchError(error => [SessionActions.persistSessionFailed(error)]),
            ),
        ),
    )
}

const deleteSessionEpic: SessionEpic = (action$, store, { fs, sessionManager }) =>
    action$.pipe(
        ofType("DELETE_SESSION"),
        flatMap(() => {
            const { selected, currentSession } = store.getState()
            const sessionToDelete = selected || currentSession
            return from(fs.remove(sessionToDelete.file)).pipe(
                flatMap(() => [
                    SessionActions.deleteSessionSuccess(),
                    SessionActions.populateSessions(),
                ]),
                catchError(error => [SessionActions.deleteSessionFailed(error)]),
            )
        }),
    )

const restoreSessionEpic: SessionEpic = (action$, store, { sessionManager }) =>
    action$.pipe(
        ofType("RESTORE_SESSION"),
        flatMap((action: IRestoreSession) =>
            from(sessionManager.restoreSession(action.payload.sessionName)).pipe(
                flatMap(session => [
                    SessionActions.setCurrentSession(session),
                    SessionActions.populateSessions(),
                ]),
            ),
        ),
        catchError(error => [SessionActions.restoreSessionError(error)]),
    )

const fetchSessionsEpic: SessionEpic = (action$, store, { fs, sessionManager }) =>
    action$.pipe(
        ofType("POPULATE_SESSIONS"),
        flatMap((action: IPopulateSessions) => {
            return from(
                fs.readdir(sessionManager.sessionsDir).then(async dir => {
                    const promises = dir.map(async file => {
                        // use fs.stat mtime to figure when last a file was modified
                        const { mtime } = await fs.stat(path.join(sessionManager.sessionsDir, file))
                        const [name] = file.split(".")
                        return {
                            name,
                            file: path.join(sessionManager.sessionsDir, file),
                            updatedAt: mtime.toDateString(),
                        }
                    })
                    const metadata = await Promise.all(promises)
                    const sessions = metadata.map(({ file, name, updatedAt }) => ({
                        ...sessionManager.getSessionMetadata(name, file),
                        updatedAt,
                    }))
                    return sessions
                }),
            ).flatMap(sessions => [SessionActions.getAllSessions(sessions)])
        }),
    )

const findSelectedSession = (sessions: ISession[], selected: string) =>
    sessions.find(session => session.id === selected)

const updateSessions = (sessions: ISession[], newSession: ISession) =>
    sessions.map(session => (session.id === newSession.id ? newSession : session))

function reducer(state: ISessionState, action: ISessionActions) {
    switch (action.type) {
        case "UPDATE_SESSION":
            return {
                ...state,
                sessions: updateSessions(state.sessions, action.payload.session),
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
        case "DELETE_SESSION_SUCCESS":
            return {
                ...state,
                currentSession: null,
            }
        case "SET_CURRENT_SESSION":
            return {
                ...state,
                currentSession: action.payload.session,
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
            combineEpics(
                fetchSessionsEpic,
                persistSessionEpic,
                restoreSessionEpic,
                updateCurrentSessionEpic,
                deleteSessionEpic,
            ),
            { dependencies },
        ),
    ])

export default createStore
