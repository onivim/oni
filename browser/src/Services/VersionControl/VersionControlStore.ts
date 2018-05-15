import { createStore as createReduxStore } from "./../../Redux"
import { StatusResult } from "./VersionControlProvider"

export interface IState {
    status: StatusResult
    hasFocus: boolean
    hasError: boolean
}

interface IGenericAction<T, P = undefined> {
    type: T
    payload?: P
}

export const DefaultState: IState = {
    status: {
        currentBranch: null,
        staged: [],
        conflicted: [],
        created: [],
        modified: [],
        remoteTrackingBranch: null,
        deleted: [],
        untracked: [],
        ahead: null,
        behind: null,
    },
    hasFocus: null,
    hasError: false,
}

type IEnterAction = IGenericAction<"ENTER">
type ILeaveAction = IGenericAction<"LEAVE">
type IErrorAction = IGenericAction<"ERROR">
type IStatusAction = IGenericAction<"STATUS", { status: StatusResult }>
type IAction = IStatusAction | IEnterAction | ILeaveAction | IErrorAction

function reducer(state: IState, action: IAction) {
    switch (action.type) {
        case "ENTER":
            return { ...state, hasFocus: true }
        case "LEAVE":
            return { ...state, hasFocus: false }
        case "STATUS":
            return {
                ...state,
                status: action.payload.status,
            }
        case "ERROR":
            return {
                ...state,
                hasError: true,
            }
        default:
            return state
    }
}

export default createReduxStore("Version Control", reducer, DefaultState)
