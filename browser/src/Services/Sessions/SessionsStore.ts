import { Store } from "redux"

import { ISession } from "./"
import { createStore as createReduxStore } from "./../../Redux"

export interface ISessionState {
    sessions: ISession[]
}

const DefaultState: ISessionState = {
    sessions: [],
}

interface IGenericAction<N, T> {
    type: N
    payload: T
}

export type ISessionStore = Store<ISessionState>

type IUpdateMultipleSessions = IGenericAction<"UPDATE_MULTIPLE_SESSIONS", { sessions: ISession[] }>
type IUpdateSession = IGenericAction<"UPDATE_SESSION", { session: ISession }>

type ISessionActions = IUpdateMultipleSessions | IUpdateSession

export const SessionActions = {
    updateSessions: (sessions: ISession[]) => ({
        type: "UPDATE_MULTIPLE_SESSIONS",
        payload: { sessions },
    }),
    updateSession: (session: ISession) => ({
        type: "UPDATE_SESSION",
        payload: { session },
    }),
}

function reducer(state: ISessionState, action: ISessionActions) {
    switch (action.type) {
        case "UPDATE_SESSION":
            return {
                ...state,
                sessions: [...state.sessions, action.payload.session],
            }
        case "UPDATE_MULTIPLE_SESSIONS":
            return {
                ...state,
                sessions: [...state.sessions, ...action.payload.sessions],
            }
        default:
            return state
    }
}

export default createReduxStore("sessions", reducer, DefaultState)
