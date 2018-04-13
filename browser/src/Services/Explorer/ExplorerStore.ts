/**
 * ExplorerStore.ts
 *
 * State management for the explorer split
 */

import * as last from "lodash/last"
import * as omit from "lodash/omit"
import * as path from "path"

import { Reducer, Store } from "redux"
import { combineEpics, createEpicMiddleware, Epic } from "redux-observable"
import { Observable } from "rxjs"

import * as Log from "./../../Log"
import { createStore as createReduxStore } from "./../../Redux"
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
    updated: null,
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

type RegisterAction =
    | IPasteAction
    | IDeleteSuccessAction
    | IDeleteFailAction
    | IDeleteAction
    | IUndoAction
    | IUndoSuccessAction
    | IUndoFailAction

interface IRegisterState {
    yank: ExplorerNode[]
    paste: ExplorerNode
    undo: RegisterAction[]
    updated: string[]
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

export interface IYankAction {
    type: "YANK"
    path: string
    target: ExplorerNode
}

export interface IPasteAction {
    type: "PASTE"
    path: string
    target: ExplorerNode
    pasted: ExplorerNode[]
}

export interface IDeleteAction {
    type: "DELETE"
    target: ExplorerNode
    persist: boolean
}

export interface IDeleteSuccessAction {
    type: "DELETE_SUCCESS"
    target: ExplorerNode
    persist: boolean
}

export interface IDeleteFailAction {
    type: "DELETE_FAIL"
    target: ExplorerNode
    persist: boolean
}

export interface IClearRegisterAction {
    type: "CLEAR_REGISTER"
    ids: string[]
}

interface IExpandDirectoryAction {
    type: "EXPAND_DIRECTORY"
    directoryPath: string
}

interface IRefreshAction {
    type: "REFRESH"
}

interface ISetRootDirectoryAction {
    type: "SET_ROOT_DIRECTORY"
    rootPath: string
}

interface ICollapseDirectory {
    type: "COLLAPSE_DIRECTORY"
    directoryPath: string
}

interface IExpandDirectoryResult {
    type: "EXPAND_DIRECTORY_RESULT"
    directoryPath: string
    children: FolderOrFile[]
}
interface IEnterAction {
    type: "ENTER"
}

interface ILeaveAction {
    type: "LEAVE"
}

export type ExplorerAction =
    | IEnterAction
    | ILeaveAction
    | IExpandDirectoryResult
    | ICollapseDirectory
    | ISetRootDirectoryAction
    | IExpandDirectoryAction
    | IDeleteFailAction
    | IRefreshAction
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

// Helper functions for Updating state ========================================================
export const removePastedNode = (nodeArray: ExplorerNode[], ids: string[]): ExplorerNode[] => {
    const difference = nodeArray.filter(node => !ids.includes(node.id))
    return difference
}

export const removeUndoItem = (undoArray: RegisterAction[]): RegisterAction[] =>
    undoArray.slice(0, undoArray.length - 1)

const getInitialLocation = (file: ExplorerNode, pasteTarget: ExplorerNode) => {
    const originalFile = getPathForNode(file)

    const targetDirectory =
        pasteTarget.type === "file"
            ? path.dirname(pasteTarget.filePath)
            : getPathForNode(pasteTarget)

    const fileOrFolderPath = getPathForNode(file)
    const filename = path.basename(fileOrFolderPath)
    return {
        newLocation: path.join(targetDirectory, filename),
        originalLocation: originalFile,
    }
}

// Do not add un-undoable action to the undo list
export const shouldAddDeletion = (action: IDeleteSuccessAction) => (action.persist ? [action] : [])

const getUpdatedPasteNode = (action: IPasteAction) =>
    action.pasted.map(node => getInitialLocation(node, action.target)).map(node => node.newLocation)

const getUpdatedDeleteNode = (action: IDeleteSuccessAction) => [getPathForNode(action.target)]

type Updates = IPasteAction | IDeleteSuccessAction | IUndoSuccessAction

export const getUpdatedNode = (action: Updates, state?: IRegisterState): string[] => {
    switch (action.type) {
        case "PASTE":
            return getUpdatedPasteNode(action)
        case "DELETE_SUCCESS":
            return getUpdatedDeleteNode(action)
        case "UNDO_SUCCESS":
            const lastAction = last(state.undo)
            if (lastAction.type === "DELETE_SUCCESS") {
                return getUpdatedDeleteNode(lastAction)
            } else if (lastAction.type === "PASTE") {
                return lastAction.pasted.map(node => getPathForNode(node))
            }
            return []
        default:
            return []
    }
}

const expandOrNull = (target: ExplorerNode): IExpandDirectoryAction[] =>
    target && target.type === "folder" ? [Actions.expandDirectory(target.folderPath)] : []

/**
 * Wrap a function in a try catch that returns the success action or the fail action
 *
 * @name async
 * @function
 * @param {Function} fn An async function to call
 * @param {any} ...args The function's arguments
 * @returns {RegisterAction} A success or fail action
 */
// tslint:disable:line: ban-types
const wrapInTryCatch = <T extends Function, U = any>(
    success: RegisterAction,
    fail: RegisterAction,
) => async (fn: T, ...args: U[]) => {
    try {
        await fn(...args)
        return success
    } catch (e) {
        Log.warn(e)
        return fail
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

export const nameInNewDir = (dirPath: string, nodePath: string) =>
    path.join(dirPath, path.basename(nodePath))

const actionsOfType = (register: RegisterAction[]) => <T extends RegisterAction>(type: string) =>
    register.filter(a => a.type === type) as T[]

// Strongly typed actions/action-creators to be used in multiple epics
const Actions = {
    undoFail: { type: "UNDO_FAIL" } as IUndoFailAction,
    undoSuccess: { type: "UNDO_SUCCESS" } as IUndoSuccessAction,
    paste: { type: "PASTE" } as IPasteAction,
    refresh: { type: "REFRESH" } as IRefreshAction,
    clearRegister: (ids: string[]) => ({ type: "CLEAR_REGISTER", ids } as IClearRegisterAction),
    deleteFail: (target: ExplorerNode, persist: boolean) =>
        ({ type: "DELETE_FAIL", target, persist } as IDeleteFailAction),
    deleteSuccess: (target: ExplorerNode, persist: boolean) =>
        ({ type: "DELETE_SUCCESS", target, persist } as IDeleteSuccessAction),
    expandDirectory: (directoryPath: string) =>
        ({ type: "EXPAND_DIRECTORY", directoryPath } as IExpandDirectoryAction),
    Null: { type: null } as ExplorerAction,
    expandDirectoryResult: (pathToExpand: string, sortedFilesAndFolders: FolderOrFile[]) =>
        ({
            type: "EXPAND_DIRECTORY_RESULT",
            directoryPath: pathToExpand,
            children: sortedFilesAndFolders,
        } as ExplorerAction),
}

// Yank, Paste Delete register =============================
// The undo register is essentially a list of past actions
// => [paste, delete, paste], when an action is carried out
// it is added to the back of the stack when an undo is triggered
// it is removed.
// The most recently actioned node(s) path(s) are set to the value of
// the updated field, this is used to animate updated fields.

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
                updated: getUpdatedNode(action),
            }
        case "UNDO_SUCCESS":
            return {
                ...state,
                undo: removeUndoItem(state.undo),
                updated: getUpdatedNode(action, state),
            }
        case "CLEAR_REGISTER":
            return {
                ...state,
                paste: EmptyNode,
                yank: removePastedNode(state.yank, action.ids),
            }
        case "DELETE_SUCCESS":
            return {
                ...state,
                undo: [...state.undo, ...shouldAddDeletion(action)],
                updated: getUpdatedNode(action),
            }
        case "LEAVE":
            return { ...DefaultRegisterState, undo: state.undo }
        case "DELETE_FAIL":
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

const setRootDirectoryEpic: Epic<ExplorerAction, IExplorerState> = (action$, store) =>
    action$.ofType("SET_ROOT_DIRECTORY").map((action: ISetRootDirectoryAction) => {
        if (!action.rootPath) {
            return Actions.Null
        }

        return Actions.expandDirectory(action.rootPath)
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

const pasteEpic = (fileSystem: IFileSystem): Epic<ExplorerAction, IExplorerState> => (
    action$,
    store,
) =>
    action$
        .ofType("PASTE")
        .concatMap(async ({ target, pasted }: IPasteAction) => {
            const ids = await Promise.all(
                pasted.map(async yankedItem => {
                    const sourcePath = getPathForNode(yankedItem)
                    const destPath =
                        target.type === "file"
                            ? path.dirname(target.filePath)
                            : getPathForNode(target)
                    const newPath = nameInNewDir(destPath, sourcePath)
                    await fileSystem.move(sourcePath, newPath)
                    return yankedItem.id
                }),
            )
            return { ids, target }
        })
        .flatMap(({ ids, target }) => [
            Actions.clearRegister(ids),
            ...expandOrNull(target),
            Actions.refresh,
        ])

const undoEpic = (fileSystem: IFileSystem): Epic<ExplorerAction, IExplorerState> => (
    action$,
    store,
) =>
    action$
        .ofType("UNDO")
        .flatMap(async action => {
            const { register: { undo } } = store.getState()
            const { type } = last(undo)
            const getActions = actionsOfType(undo)
            const undoAction = wrapInTryCatch(Actions.undoSuccess, Actions.undoFail)

            switch (type) {
                case "PASTE":
                    const pasteActions = getActions<IPasteAction>("PASTE")
                    const { pasted, target: dir } = last(pasteActions)
                    const filesAndFolders = pasted.map(file => getInitialLocation(file, dir))
                    const resOne = await undoAction(fileSystem.moveNodesBack, filesAndFolders)
                    return { result: resOne, target: dir }

                case "DELETE_SUCCESS":
                    const deleteActions = getActions<IDeleteSuccessAction>("DELETE_SUCCESS")
                    const persistedActions = deleteActions.filter(a => a.persist)
                    const { target } = last(persistedActions)
                    const resTwo = await undoAction(fileSystem.restoreNode, getPathForNode(target))
                    return { result: resTwo, target }

                default:
                    return { result: Actions.undoFail, target: null }
            }
        })
        .flatMap(({ result, target }) => [result, ...expandOrNull(target), Actions.refresh])

export const deleteEpic = (fileSystem: IFileSystem): Epic<ExplorerAction, IExplorerState> => (
    action$,
    store,
) =>
    action$
        .ofType("DELETE")
        .mergeMap(async (action: IDeleteAction) => {
            const { target, persist } = action
            const deleteAction = wrapInTryCatch(
                Actions.deleteSuccess(target, persist),
                Actions.deleteFail(target, persist),
            )
            const fullPath = getPathForNode(target)
            const maxSize: number = configuration.getValue("explorer.maxUndoFileSizeInBytes")
            const persistEnabled: boolean = configuration.getValue("explorer.persistDeletedFiles")
            const canPersistNode = await fileSystem.canPersistNode(fullPath, maxSize)

            const persistOrDelete = async () =>
                persistEnabled && persist && canPersistNode
                    ? fileSystem.persistNode(fullPath)
                    : fileSystem.deleteNode(target)
            return deleteAction(persistOrDelete)
        })
        .flatMap(successOrFailAction => [successOrFailAction, Actions.refresh])

export const clearYankRegisterEpic: Epic<ExplorerAction, IExplorerState> = (action$, store) =>
    action$.ofType("YANK").mergeMap((action: IYankAction) => {
        const oneMinute = 60_000
        return Observable.timer(oneMinute).mapTo(Actions.clearRegister([action.target.id]))
    })

const refreshEpic: Epic<ExplorerAction, IExplorerState> = (action$, store) =>
    action$.ofType("REFRESH").mergeMap(() => {
        const state = store.getState()

        return Object.keys(state.expandedFolders).map(p => {
            return Actions.expandDirectory(p)
        })
    })

const expandDirectoryEpic = (fileSystem: IFileSystem): Epic<ExplorerAction, IExplorerState> => (
    action$,
    store,
) =>
    action$.ofType("EXPAND_DIRECTORY").flatMap(async (action: ExplorerAction) => {
        if (action.type !== "EXPAND_DIRECTORY") {
            return Actions.Null
        }

        const pathToExpand = action.directoryPath

        const filesAndFolders = await fileSystem.readdir(pathToExpand)

        const sortedFilesAndFolders = filesAndFolders.sort(sortFilesAndFoldersFunc)

        return Actions.expandDirectoryResult(pathToExpand, sortedFilesAndFolders)
    })

export const createStore = (fileSystem: IFileSystem = OniFileSystem): Store<IExplorerState> => {
    return createReduxStore("Explorer", reducer, DefaultExplorerState, [
        createEpicMiddleware(
            combineEpics(
                refreshEpic,
                setRootDirectoryEpic,
                clearYankRegisterEpic,
                pasteEpic(fileSystem),
                undoEpic(fileSystem),
                deleteEpic(fileSystem),
                expandDirectoryEpic(fileSystem),
            ),
        ),
    ])
}
