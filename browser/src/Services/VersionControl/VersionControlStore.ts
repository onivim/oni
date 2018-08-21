import { createStore as createReduxStore } from "./../../Redux"
import { Commits, Logs, StatusResult } from "./VersionControlProvider"

export interface PrevCommits extends Commits {
    message: string
}

interface ICommit {
    files: string[]
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
    logs: Logs
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
    logs: {
        all: [],
        total: null,
        latest: null,
    },
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
        files: [],
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
type ILogAction = IGenericAction<"LOG", { logs: Logs }>
type ICommitStartAction = IGenericAction<"COMMIT_START", { files: string[] }>
type ICommitCancelAction = IGenericAction<"COMMIT_CANCEL">
type ICommitSuccessAction = IGenericAction<"COMMIT_SUCCESS", { commit: Commits }>
type ICommitFailAction = IGenericAction<"COMMIT_FAIL">
type IUpdateCommitMessageAction = IGenericAction<"UPDATE_COMMIT_MESSAGE", { message: string[] }>
type IAction =
    | ILoadingAction
    | IToggleHelpAction
    | ISelectAction
    | IStatusAction
    | ILogAction
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
    setLoading: (isLoading: boolean) => ILoadingAction
}

export const VersionControlActions: IVersionControlActions = {
    setLoading: (isLoading: boolean, type = "commit") => ({
        type: "LOADING",
        payload: { loading: isLoading, type },
    }),
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
            return {
                ...state,
                commit: { ...state.commit, files: action.payload.files, active: true },
            }
        case "COMMIT_CANCEL":
            return { ...state, commit: { ...state.commit, message: [], active: false, files: [] } }
        case "COMMIT_SUCCESS":
            const {
                message: [message],
            } = state.commit
            return {
                ...state,
                loading: {
                    active: false,
                    type: null,
                },
                commit: {
                    files: [],
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
                loading: {
                    active: false,
                    type: null,
                },
                commit: {
                    ...state.commit,
                    files: [],
                    message: [],
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
        case "LOG":
            return {
                ...state,
                logs: action.payload.logs,
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
