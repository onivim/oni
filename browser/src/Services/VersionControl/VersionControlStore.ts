import { createStore as createReduxStore } from "./../../Redux"
import { StatusResult } from "./VersionControlProvider"

export interface IState {
    status: StatusResult
    hasFocus: boolean
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
}

type IEnterAction = IGenericAction<"ENTER">
type ILeaveAction = IGenericAction<"LEAVE">
type IStatusAction = IGenericAction<"STATUS", { status: StatusResult }>
type IAction = IStatusAction | IEnterAction | ILeaveAction

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
        default:
            return state
    }
}

export default createReduxStore("Version Control", reducer, DefaultState)
