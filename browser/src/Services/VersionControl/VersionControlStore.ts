import { createStore as createReduxStore } from "./../../Redux"
import { StatusResult } from "./VersionControlProvider"

export interface VersionControlState {
    status: StatusResult
    hasFocus: boolean
    hasError: boolean
    activated: boolean
}

interface IGenericAction<T, P = undefined> {
    type: T
    payload?: P
}

export const DefaultState: VersionControlState = {
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
    activated: null,
    hasError: false,
}

type IActivateAction = IGenericAction<"ACTIVATE">
type IDeactivateAction = IGenericAction<"DEACTIVATE">
type IEnterAction = IGenericAction<"ENTER">
type ILeaveAction = IGenericAction<"LEAVE">
type IErrorAction = IGenericAction<"ERROR">
type IStatusAction = IGenericAction<"STATUS", { status: StatusResult }>
type IAction =
    | IStatusAction
    | IEnterAction
    | ILeaveAction
    | IErrorAction
    | IDeactivateAction
    | IActivateAction

export function reducer(state: VersionControlState, action: IAction) {
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
        case "DEACTIVATE":
            return {
                ...state,
                activated: false,
                status: DefaultState.status,
            }
        case "ACTIVATE":
            return {
                ...state,
                activated: true,
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
