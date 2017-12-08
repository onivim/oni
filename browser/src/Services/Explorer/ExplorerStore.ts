/**
 * ExplorerStore.ts
 *
 * State management for the explorer split
 */

// import * as fs from "fs"

import { Reducer, Store } from "redux"
import { combineEpics, createEpicMiddleware, Epic } from "redux-observable"

import { createStore as createReduxStore } from "./../../Redux"

export interface IFolderState {
    type: "folder"
    fullPath: string
    expanded: boolean
    children: FolderOrFile[]
    isLoading: boolean
}

export const DefaultFolderState: IFolderState = {
    type: "folder",
    fullPath: null,
    expanded: false,
    children: [],
    isLoading: true,
}

export interface IFileState {
    type: "file"
    fullPath: string
}

export interface IRecentFile {
    filePath: string
    modified: boolean
}

export type FolderOrFile = IFolderState | IFileState

export interface IExplorerState {
    // Recent
    recentFiles: IRecentFile[]

    // Open workspace
    rootFolder: IFolderState
}

export const DefaultExplorerState: IExplorerState = {
    recentFiles: [
        { filePath: "File1.ts", modified: false },
        { filePath: "File2.ts", modified: false },
    ],
    rootFolder: null,
}

export type ExplorerAction = {
    type: "SET_ROOT_DIRECTORY",
    rootPath: string
}

export const rootFolderReducer: Reducer<IFolderState> = (
    state: IFolderState  = DefaultFolderState,
    action: ExplorerAction,
) => {
    switch (action.type) {
        case "SET_ROOT_DIRECTORY": 
            return {
                ...state,
                fullPath: action.rootPath,
                isLoading: true,
                children: [],
            }

        default: 
            return state
    }
}

export const reducer: Reducer<IExplorerState> = (
    state: IExplorerState = DefaultExplorerState,
    action: ExplorerAction,
) => {
    return {
        ...state,
        rootFolder: rootFolderReducer(state.rootFolder, action)
    }
}

const NullAction: ExplorerAction = { type: null } as ExplorerAction

const updateContentsEpic: Epic<ExplorerAction, IExplorerState> = (action$, store) => 
    action$.ofType("SET_ROOT_DIRECTORY")
        .map((action) => {
            console.log("GOT ACTION!")
            return NullAction
        })


export const createStore = (): Store<IExplorerState> => {
    return createReduxStore("Explorer", 
        reducer, 
        DefaultExplorerState,
        [createEpicMiddleware(combineEpics(
            updateContentsEpic,
        ))])
}
