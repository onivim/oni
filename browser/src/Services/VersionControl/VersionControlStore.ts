import { createStore as createReduxStore } from "./../../Redux"
import { Commits, StatusResult } from "./VersionControlProvider"

export interface PrevCommits extends Commits {
    message: string
}

interface ICommit {
    active: boolean
    message: string[]
    previousCommits: PrevCommits[]
}

export type ProviderActions = "commit" | "pull" | "fetch" | "stage"

export interface VersionControlState {
    loading: {
        active: boolean
        type: ProviderActions
    }
    selected: string
    status: StatusResult
    commit: ICommit
    hasFocus: boolean
    hasError: boolean
    activated: boolean
    help: {
        active: boolean
    }
}

interface IGenericAction<T, P = undefined> {
    type: T
    payload?: P
}

export const DefaultState: VersionControlState = {
    loading: {
        active: false,
        type: null,
    },
    selected: null,
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
    commit: {
        message: [],
        active: false,
        previousCommits: [],
    },
    hasFocus: null,
    activated: null,
    hasError: false,
    help: {
        active: false,
    },
}

type ISelectAction = IGenericAction<"SELECT", { selected: string }>
type ILoadingAction = IGenericAction<"LOADING", { loading: boolean; type: ProviderActions }>
type IActivateAction = IGenericAction<"ACTIVATE">
type IDeactivateAction = IGenericAction<"DEACTIVATE">
type IToggleHelpAction = IGenericAction<"TOGGLE_HELP">
type IEnterAction = IGenericAction<"ENTER">
type ILeaveAction = IGenericAction<"LEAVE">
type IErrorAction = IGenericAction<"ERROR">
type IStatusAction = IGenericAction<"STATUS", { status: StatusResult }>
type ICommitStartAction = IGenericAction<"COMMIT_START">
type ICommitCancelAction = IGenericAction<"COMMIT_CANCEL">
type ICommitSuccessAction = IGenericAction<"COMMIT_SUCCESS", { commit: Commits }>
type ICommitFailAction = IGenericAction<"COMMIT_FAIL">
type IUpdateCommitMessageAction = IGenericAction<"UPDATE_COMMIT_MESSAGE", { message: string[] }>
type IAction =
    | ILoadingAction
    | IToggleHelpAction
    | ISelectAction
    | IStatusAction
    | IEnterAction
    | ILeaveAction
    | IErrorAction
    | IDeactivateAction
    | IActivateAction
    | ICommitStartAction
    | ICommitCancelAction
    | ICommitSuccessAction
    | ICommitFailAction
    | IUpdateCommitMessageAction

export interface IVersionControlActions {
    cancelCommit: () => ICommitCancelAction
    updateCommitMessage: (message: string[]) => IUpdateCommitMessageAction
}

export const VersionControlActions: IVersionControlActions = {
    cancelCommit: () => ({ type: "COMMIT_CANCEL" }),
    updateCommitMessage: (message: string[]) => ({
        type: "UPDATE_COMMIT_MESSAGE",
        payload: { message },
    }),
}

export function reducer(state: VersionControlState, action: IAction) {
    switch (action.type) {
        case "ENTER":
            return { ...state, hasFocus: true }
        case "LOADING":
            return {
                ...state,
                loading: {
                    active: action.payload.loading,
                    type: action.payload.type,
                },
            }
        case "SELECT":
            return { ...state, selected: action.payload.selected }
        case "COMMIT_START":
            return { ...state, commit: { ...state.commit, active: true } }
        case "COMMIT_CANCEL":
            return { ...state, commit: { ...state.commit, message: [], active: false } }
        case "COMMIT_SUCCESS":
            const {
                message: [message],
            } = state.commit
            return {
                ...state,
                commit: {
                    message: [] as string[],
                    active: false,
                    previousCommits: [
                        ...state.commit.previousCommits,
                        { ...action.payload.commit, message },
                    ],
                },
            }
        case "COMMIT_FAIL":
            return {
                ...state,
                commit: {
                    ...state.commit,
                    message: [] as string[],
                    active: false,
                },
            }
        case "UPDATE_COMMIT_MESSAGE":
            return { ...state, commit: { ...state.commit, message: action.payload.message } }
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
        case "TOGGLE_HELP":
            return {
                ...state,
                help: {
                    active: !state.help.active,
                },
            }
        default:
            return state
    }
}

export default createReduxStore("Version Control", reducer, DefaultState)
