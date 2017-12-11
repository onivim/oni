/**
 * ExplorerStore.ts
 *
 * State management for the explorer split
 */

import * as fs from "fs"

import { Reducer, Store } from "redux"
import { combineEpics, createEpicMiddleware, Epic } from "redux-observable"

import { createStore as createReduxStore } from "./../../Redux"

export interface IFolderState {
    type: "folder"
    fullPath: string
}

export const DefaultFolderState: IFolderState = {
    type: "folder",
    fullPath: null,
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

export interface ExpandedFolders { [fullPath: string]: FolderOrFile[]}

export interface IExplorerState {
    // Recent
    openedFiles: IRecentFile[]

    // Open workspace
    rootFolder: IFolderState

    expandedFolders: ExpandedFolders

    selectedId: string

    hasFocus: boolean

    styling: IExplorerStyling
}

export interface IExplorerStyling {
    fontFamily: string
    fontSize: string
}

export const DefaultExplorerStyle: IExplorerStyling = {
    fontFamily: null,
    fontSize: null,
}

export const DefaultExplorerState: IExplorerState = {
    openedFiles: [
        { filePath: "File1.ts", modified: false },
        { filePath: "File2.ts", modified: false },
    ],
    rootFolder: null,
    expandedFolders: {},
    selectedId: "explorer",
    styling: DefaultExplorerStyle,
    hasFocus: false,
}

export type ExplorerAction = {
    type: "SET_ROOT_DIRECTORY",
    rootPath: string,
} | {
    type: "EXPAND_DIRECTORY",
    directoryPath: string,
} | {
    type: "EXPAND_DIRECTORY_RESULT",
    directoryPath: string,
    children: FolderOrFile[],
} | {
    type: "SET_SELECTED_ID",
    selectedId: string,
} | {
    type: "SET_FONT",
    fontFamily: string,
    fontSize: string,
} | {
    type: "ENTER",
} | {
    type: "LEAVE",
}

export const rootFolderReducer: Reducer<IFolderState> = (
    state: IFolderState  = DefaultFolderState,
    action: ExplorerAction,
) => {
    switch (action.type) {
        case "SET_ROOT_DIRECTORY":
            return {
                ...state,
                type: "folder",
                fullPath: action.rootPath,
            }

        default:
            return state
    }
}

export const expandedFolderReducer: Reducer<ExpandedFolders> = (
    state: ExpandedFolders = {},
    action: ExplorerAction,
) => {
    switch (action.type) {
        case "SET_ROOT_DIRECTORY":
            return {}
        case "EXPAND_DIRECTORY_RESULT":
            return {
                ...state,
                [action.directoryPath]: action.children,
            }
        default:
            return state
    }
}

export const selectedIdReducer: Reducer<string> = (
    state: string = null,
    action: ExplorerAction,
) => {
    switch (action.type) {
        case "SET_SELECTED_ID":
            return action.selectedId
        default:
            return state
    }
}

export const stylingReducer: Reducer<IExplorerStyling> = (
    state: IExplorerStyling = null,
    action: ExplorerAction,
) => {
    switch (action.type) {
        case "SET_FONT":
            return {
                fontFamily: action.fontFamily,
                fontSize: action.fontSize,
            }
        default:
            return state
    }
}

export const hasFocusReducer: Reducer<boolean> = (
    state: boolean = false,
    action: ExplorerAction,
) => {
    switch (action.type) {
        case "ENTER":
            return true
        case "LEAVE":
            return false
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
        hasFocus: hasFocusReducer(state.hasFocus, action),
        rootFolder: rootFolderReducer(state.rootFolder, action),
        expandedFolders: expandedFolderReducer(state.expandedFolders, action),
        selectedId: selectedIdReducer(state.selectedId, action),
        styling: stylingReducer(state.styling, action),
    }
}

const NullAction: ExplorerAction = { type: null } as ExplorerAction

const setRootDirectoryEpic: Epic<ExplorerAction, IExplorerState> = (action$, store) =>
    action$.ofType("SET_ROOT_DIRECTORY")
        .map((action) => {

            if (action.type !== "SET_ROOT_DIRECTORY") {
                return NullAction
            }

            return {
                type: "EXPAND_DIRECTORY",
                directoryPath: action.rootPath,
            } as ExplorerAction
        })

const sortFilesAndFoldersFunc = (a: FolderOrFile, b: FolderOrFile) => {
     if (a.type < b.type) {
         return 1
     } else if (a.type > b.type) {
         return -1
     } else {
         if (a.fullPath < b.fullPath) {
             return -1
         } else {
             return 1
         }
     }
 }

const expandDirectoryEpic: Epic<ExplorerAction, IExplorerState> = (action$, store) =>
    action$.ofType("EXPAND_DIRECTORY")
        .map((action) => {
            if (action.type !== "EXPAND_DIRECTORY") {
                return NullAction
            }

            const pathToExpand = action.directoryPath
            const files = fs.readdirSync(pathToExpand)

            const filesAndFolders = files.map((f) => {
                const stat = fs.statSync(f)

                if (stat.isDirectory()) {
                    return {
                        type: "folder",
                        fullPath: f,
                    }
                } else {
                    return {
                        type: "file",
                        fullPath: f,
                    }
                }
            })

            const sortedFilesAndFolders = filesAndFolders.sort(sortFilesAndFoldersFunc)

            return {
                type: "EXPAND_DIRECTORY_RESULT",
                directoryPath: pathToExpand,
                children: sortedFilesAndFolders,
            } as ExplorerAction
        })

export const createStore = (): Store<IExplorerState> => {
    return createReduxStore("Explorer",
        reducer,
        DefaultExplorerState,
        [createEpicMiddleware(combineEpics(
            setRootDirectoryEpic,
            expandDirectoryEpic,
        ))])
}
