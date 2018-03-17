/**
 * ExplorerStore.ts
 *
 * State management for the explorer split
 */

import * as fs from "fs"

import * as omit from "lodash/omit"
import { Reducer, Store } from "redux"
import { combineEpics, createEpicMiddleware, Epic } from "redux-observable"

import { createStore as createReduxStore } from "./../../Redux"
import { ExplorerNode } from "./ExplorerSelectors"

import { FileSystem, IFileSystem } from "./ExplorerFileSystem"

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

export interface ExpandedFolders {
    [fullPath: string]: FolderOrFile[]
}

export interface OpenedFiles {
    [fullPath: string]: any
}

export interface IFileSystem {
    readdir(fullPath: string): Promise<FolderOrFile[]>
    delete(fullPath: string): Promise<void>
}

interface ITargetNode {
    target: ExplorerNode
    path: string
}

export interface IExplorerState {
    // Open workspace
    rootFolder: IFolderState

    expandedFolders: ExpandedFolders

    hasFocus: boolean
    yank: ITargetNode
    paste: ITargetNode
}

export const DefaultExplorerState: IExplorerState = {
    rootFolder: null,
    expandedFolders: {},
    hasFocus: false,
    yank: { path: "", target: null },
    paste: { path: "", target: null },
}

export type ExplorerAction =
    | {
          type: "SET_ROOT_DIRECTORY"
          rootPath: string
      }
    | {
          type: "EXPAND_DIRECTORY"
          directoryPath: string
      }
    | {
          type: "COLLAPSE_DIRECTORY"
          directoryPath: string
      }
    | {
          type: "EXPAND_DIRECTORY_RESULT"
          directoryPath: string
          children: FolderOrFile[]
      }
    | {
          type: "ENTER"
      }
    | {
          type: "LEAVE"
      }
    | {
          type: "REFRESH"
      }
    | {
          type: "YANK"
          path: string
          target: ExplorerNode
      }
    | {
          type: "PASTE"
          path: string
          target: ExplorerNode
      }

export const rootFolderReducer: Reducer<IFolderState> = (
    state: IFolderState = DefaultFolderState,
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

export const yankRegisterReducer: Reducer<IExplorerState> = (
    state: IExplorerState = DefaultExplorerState,
    action: ExplorerAction,
) => {
    switch (action.type) {
        case "YANK":
            return {
                ...state,
                yank: {
                    path: action.path,
                    target: action.target,
                },
            }
        case "PASTE":
            return {
                ...state,
                paste: {
                    path: action.path,
                    target: action.target,
                },
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
        case "COLLAPSE_DIRECTORY":
            return omit(state, [action.directoryPath])
        case "EXPAND_DIRECTORY_RESULT":
            return {
                ...state,
                [action.directoryPath]: action.children,
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
        yankAndPaste: yankRegisterReducer(state, action),
    }
}

const NullAction: ExplorerAction = { type: null } as ExplorerAction

const setRootDirectoryEpic: Epic<ExplorerAction, IExplorerState> = (action$, store) =>
    action$.ofType("SET_ROOT_DIRECTORY").map(action => {
        if (action.type !== "SET_ROOT_DIRECTORY") {
            return NullAction
        }

        if (!action.rootPath) {
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

const refreshEpic: Epic<ExplorerAction, IExplorerState> = (action$, store) =>
    action$.ofType("REFRESH").mergeMap(() => {
        const state = store.getState()

        return Object.keys(state.expandedFolders).map(p => {
            return {
                type: "EXPAND_DIRECTORY",
                directoryPath: p,
            } as ExplorerAction
        })
    })

const expandDirectoryEpic = (fileSystem: IFileSystem): Epic<ExplorerAction, IExplorerState> => (
    action$,
    store,
) =>
    action$.ofType("EXPAND_DIRECTORY").flatMap(async (action: ExplorerAction) => {
        if (action.type !== "EXPAND_DIRECTORY") {
            return NullAction
        }

        const pathToExpand = action.directoryPath

        const filesAndFolders = await fileSystem.readdir(pathToExpand)

        const sortedFilesAndFolders = filesAndFolders.sort(sortFilesAndFoldersFunc)

        return {
            type: "EXPAND_DIRECTORY_RESULT",
            directoryPath: pathToExpand,
            children: sortedFilesAndFolders,
        } as ExplorerAction
    })

export const createStore = (fileSystem?: IFileSystem): Store<IExplorerState> => {
    fileSystem = fileSystem || new FileSystem(fs)

    return createReduxStore("Explorer", reducer, DefaultExplorerState, [
        createEpicMiddleware(
            combineEpics(setRootDirectoryEpic, expandDirectoryEpic(fileSystem), refreshEpic),
        ),
    ])
}
