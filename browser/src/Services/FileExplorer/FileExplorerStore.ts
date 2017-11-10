/**
 * FileExplorerStore.ts
 *
 * Redux store for file explorer
 */

export interface IFolderState {
    type: "folder"
    fullPath: string
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
} | {
    type: "UPDATE_FILES_AND_FOLDERS",
    filesAndFolders: FolderOrFile[],
}

export const reducer: Reducer<IFileExplorerState> = (
    state: IFileExplorerState = {
        rootPath: null,
        filesOrFolders: [],
        isLoading: true,
    },
    action: IFileExplorerAction
) => {

    switch (action.type) {
        case "SET_ROOT_DIRECTORY":
            return {
            ...state,
            isLoading: true,
            rootPath: action.newRootPath,
        }
        case "UPDATE_FILES_AND_FOLDERS":
            return {
            ...state,
            filesOrFolders: action.filesAndFolders,
        }

        default:
            return state
    }
}

import * as fs from "fs"

import { applyMiddleware, createStore, Reducer, Store } from "redux"
import { combineEpics, createEpicMiddleware, Epic } from "redux-observable"

const updateContentsEpic: Epic<IFileExplorerAction, IFileExplorerState> = (action$, store) =>
    action$.ofType("SET_ROOT_DIRECTORY")
        .map((action) => {

            const rootPath = (action as any).newRootPath
            const files = fs.readdirSync(rootPath)
            const filesAndFolders = files.map((f) => {

                const stat = fs.statSync(f)

                if (stat.isDirectory()) {
                    return {
                        type: "folder",
                        fullPath: f
                    }
                } else {
                    return {
                        type: "file",
                        fullPath: f,
                    }
                }

            })

            return {
                type: "UPDATE_FILES_AND_FOLDERS",
                filesAndFolders,
           } as IFileExplorerAction
        })

export const fileExplorerStore: Store<IFileExplorerState> = createStore(reducer,
    applyMiddleware(createEpicMiddleware(combineEpics(
        updateContentsEpic
    )))
)

fileExplorerStore.dispatch({ type: "SET_ROOT_DIRECTORY", newRootPath: process.cwd() })
