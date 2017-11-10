/**
 * FileExplorerStore.ts
 *
 * Redux store for file explorer
 */

export interface IFolderState {
    type: "folder"
    fullPath: string
    expanded: boolean
}

export interface IFileState {
    type: "file"
    fullPath: string
}

export type FolderOrFile = IFolderState | IFileState

export interface IFileExplorerState {
    rootPath: string
    filesOrFolders: FolderOrFile[]
    isLoading: boolean
}

export type IFileExplorerAction = {
    type: "SET_ROOT_DIRECTORY",
    newRootPath: string,
}

export const reducer: Reducer<IFileExplorerState> = (
    state: IFileExplorerState = {
        rootPath: null,
        filesOrFolders: [],
        isLoading: true,
    },
    action: IFileExplorerAction
) => {
    return state
}

import { applyMiddleware, createStore, Reducer } from "redux"
import { combineEpics, createEpicMiddleware, Epic } from "redux-observable"

const nullAction = { type: null } as IFileExplorerAction

const updateContentsEpic: Epic<IFileExplorerAction, IFileExplorerState> = (action$, store) =>
    action$.ofType("SET_ROOT_DIRECTORY")
        .map((action) => {
            return nullAction
        })

export const fileExplorerStore = createStore(reducer,
    applyMiddleware(createEpicMiddleware(combineEpics(
        updateContentsEpic
    )))
)
