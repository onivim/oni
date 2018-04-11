/**
 * ExplorerStore.ts
 *
 * State management for the explorer split
 */

import * as omit from "lodash/omit"
import * as path from "path"

import { Reducer, Store } from "redux"
import { combineEpics, createEpicMiddleware, Epic } from "redux-observable"
import { Observable } from "rxjs"

import { createStore as createReduxStore } from "./../../Redux"
import { tail } from "./../../Utility"
import { configuration } from "./../Configuration"
import { EmptyNode, ExplorerNode } from "./ExplorerSelectors"

import { IFileSystem, OniFileSystem } from "./ExplorerFileSystem"

export interface IFolderState {
    type: "folder"
    fullPath: string
}

export const DefaultFolderState: IFolderState = {
    type: "folder",
    fullPath: null,
}

export const DefaultRegisterState: IRegisterState = {
    yank: [],
    undo: [],
    paste: EmptyNode,
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

type RegisterAction = IPasteAction | IDeleteAction | IDeleteSuccessAction

interface IRegisterState {
    yank: ExplorerNode[]
    paste: ExplorerNode
    undo: RegisterAction[]
}

export interface IExplorerState {
    // Open workspace
    rootFolder: IFolderState

    expandedFolders: ExpandedFolders

    hasFocus: boolean
    register: IRegisterState
}

export const DefaultExplorerState: IExplorerState = {
    rootFolder: null,
    expandedFolders: {},
    hasFocus: false,
    register: DefaultRegisterState,
}

interface IUndoAction {
    type: "UNDO"
}
interface IUndoSuccessAction {
    type: "UNDO_SUCCESS"
}
interface IUndoFailAction {
    type: "UNDO_FAIL"
}

interface IYankAction {
    type: "YANK"
    path: string
    target: ExplorerNode
}

interface IPasteAction {
    type: "PASTE"
    path: string
    target: ExplorerNode
    pasted: ExplorerNode[]
}

interface IDeleteAction {
    type: "DELETE"
    target: ExplorerNode
    persist: boolean
}

export interface IDeleteSuccessAction {
    type: "DELETE_SUCCESS"
    target: ExplorerNode
    persist: boolean
}

interface IClearRegisterAction {
    type: "CLEAR_REGISTER"
    id: string
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
    | IDeleteAction
    | IDeleteSuccessAction
    | IYankAction
    | IPasteAction
    | IClearRegisterAction
    | IUndoAction
    | IUndoSuccessAction
    | IUndoFailAction

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

export const removePastedNode = (nodeArray: ExplorerNode[], id: string): ExplorerNode[] =>
    nodeArray.filter(node => node.id !== id)

export const removeUndoItem = (undoArray: RegisterAction[]): RegisterAction[] =>
    undoArray.slice(0, undoArray.length - 1)

// Do not add un-undoeable action to the undo list
export const shouldAddDeletion = (action: IDeleteSuccessAction) => (action.persist ? [action] : [])

export const yankRegisterReducer: Reducer<IRegisterState> = (
    state: IRegisterState = DefaultRegisterState,
    action: ExplorerAction,
) => {
    switch (action.type) {
        case "YANK":
            return {
                ...state,
                yank: [...state.yank, action.target],
            }
        case "PASTE":
            return {
                ...state,
                paste: action.target,
                undo: [...state.undo, action],
            }
        case "UNDO_SUCCESS":
            return {
                ...state,
                undo: removeUndoItem(state.undo),
            }
        case "CLEAR_REGISTER":
            return {
                ...state,
                paste: EmptyNode,
                yank: removePastedNode(state.yank, action.id),
            }
        case "DELETE_SUCCESS":
            return {
                ...state,
                undo: [...state.undo, ...shouldAddDeletion(action)],
            }
        case "LEAVE":
            return { ...DefaultRegisterState, undo: state.undo }
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
        register: yankRegisterReducer(state.register, action),
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

export const getPathForNode = (node: ExplorerNode) => {
    if (node.type === "file") {
        return node.filePath
    } else if (node.type === "folder") {
        return node.folderPath
    } else {
        return node.name
    }
}

const undoPaste = (file: ExplorerNode, pasteTarget: ExplorerNode) => {
    const originalFolder = path.dirname(getPathForNode(file))

    const targetDirectory =
        pasteTarget.type === "file"
            ? path.dirname(pasteTarget.filePath)
            : getPathForNode(pasteTarget)

    const fileOrFolderPath = getPathForNode(file)
    const filename = path.basename(fileOrFolderPath)
    return {
        file: path.join(targetDirectory, filename),
        folder: originalFolder,
    }
}

const actionsOfType = (register: RegisterAction[]) => (type: string) =>
    register.filter(a => a.type === type)

const undoEpic: Epic<ExplorerAction, IExplorerState> = (action$, store) =>
    action$.ofType("UNDO").flatMap(action => {
        const { register: { undo } } = store.getState()
        const getActions = actionsOfType(undo)
        const { type } = tail(undo)

        switch (type) {
            case "PASTE":
                const pasteActions = getActions("PASTE") as IPasteAction[]
                const lastPaste = tail(pasteActions)
                const { pasted, target: pasteTarget } = lastPaste

                const filesAndFolders = pasted.map(file => undoPaste(file, pasteTarget))
                OniFileSystem.moveNodes(filesAndFolders)

                return [{ type: "UNDO_SUCCESS" }, { type: "REFRESH" }] as ExplorerAction[]

            case "DELETE_SUCCESS":
                const deleteActions = getActions("DELETE_SUCCESS").filter(
                    ({ persist }: IDeleteSuccessAction) => !!persist,
                ) as IDeleteAction[]

                const { target } = tail(deleteActions)
                OniFileSystem.restoreNode(getPathForNode(target))

                return [{ type: "UNDO_SUCCESS" }, { type: "REFRESH" }] as ExplorerAction[]

            default:
                return [{ type: "UNDO_FAIL" }] as ExplorerAction[]
        }
    })

export const deleteEpic: Epic<ExplorerAction, IExplorerState> = (action$, store) =>
    action$.ofType("DELETE").flatMap((action: IDeleteAction) => {
        const result = [{ type: "REFRESH" }]
        const { target, persist } = action
        try {
            const fullPath = getPathForNode(target)
            const maxSize = configuration.getValue("explorer.maxUndoFileSizeInBytes")
            const persistEnabled = configuration.getValue("explorer.persistDeletedFiles")
            const canPersistNode = OniFileSystem.canPersistNode(fullPath, maxSize)

            persistEnabled && persist && canPersistNode
                ? OniFileSystem.persistNode(fullPath)
                : OniFileSystem.deleteNode(target)

            return [{ type: "DELETE_SUCCESS", target, persist }, ...result] as RegisterAction[]
        } catch (e) {
            return [{ type: "DELETE_FAIL", target }, ...result] as RegisterAction[]
        }
    })

export const clearYankRegisterEpic: Epic<ExplorerAction, IExplorerState> = (action$, store) =>
    action$.ofType("YANK").mergeMap((action: IYankAction) => {
        const oneMinute = 60_000
        return Observable.timer(oneMinute).mapTo({
            type: "CLEAR_REGISTER",
            id: action.target.id,
        } as IClearRegisterAction)
    })

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
    fileSystem = fileSystem || OniFileSystem

    return createReduxStore("Explorer", reducer, DefaultExplorerState, [
        createEpicMiddleware(
            combineEpics(
                undoEpic,
                refreshEpic,
                deleteEpic,
                setRootDirectoryEpic,
                clearYankRegisterEpic,
                expandDirectoryEpic(fileSystem),
            ),
        ),
    ])
}
