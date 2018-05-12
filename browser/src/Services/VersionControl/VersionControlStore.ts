import { createStore as createReduxStore } from "./../../Redux"

export interface ModifiedFile {
    changes: number
    deletions: number
    binary: boolean
    file: string
}

export interface IState {
    files: ModifiedFile[]
    hasFocus: boolean
}

interface IGenericAction<T, P = undefined> {
    type: T
    payload?: P
}

const DefaultState: IState = {
    files: [],
    hasFocus: null,
}

type IEnterAction = IGenericAction<"ENTER">
type ILeaveAction = IGenericAction<"LEAVE">
type IModifiedFilesAction = IGenericAction<"MODIFIED_FILES", { files: ModifiedFile[] }>
type IAction = IModifiedFilesAction | IEnterAction | ILeaveAction

function reducer(state: IState, action: IAction) {
    switch (action.type) {
        case "ENTER":
            return { ...state, hasFocus: true }
        case "LEAVE":
            return { ...state, hasFocus: false }
        case "MODIFIED_FILES":
            return {
                ...state,
                files: action.payload.files,
            }
        default:
            return state
    }
}

export default createReduxStore("Version Control", reducer, DefaultState)
