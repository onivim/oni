/**
 * ExplorerStore.ts
 *
 * State management for the explorer split
 */

import * as capitalize from "lodash/capitalize"
import * as last from "lodash/last"
import * as omit from "lodash/omit"
import * as path from "path"

import { Reducer, Store } from "redux"
import { combineEpics, createEpicMiddleware, Epic } from "redux-observable"

import { forkJoin } from "rxjs/observable/forkJoin"
import { fromPromise } from "rxjs/observable/fromPromise"
import { timer } from "rxjs/observable/timer"

import * as Log from "oni-core-logging"

import { createStore as createReduxStore } from "./../../Redux"
import { configuration } from "./../Configuration"
import { EmptyNode, ExplorerNode } from "./ExplorerSelectors"

import { Notifications } from "./../../Services/Notifications"
import { NotificationLevel } from "./../../Services/Notifications/NotificationStore"

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
    create: {
        active: false,
        name: null,
        nodeType: null,
    },
    rename: {
        active: false,
        target: null,
    },
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

export type RegisterAction =
    | IPasteAction
    | IDeleteSuccessAction
    | IDeleteFailAction
    | IDeleteAction
    | IUndoAction
    | IUndoSuccessAction
    | IUndoFailAction
    | IRenameSuccessAction
    | IRenameFailAction
    | ICreateNodeSuccessAction
    | ICreateNodeFailAction

interface IRegisterState {
    yank: ExplorerNode[]
    paste: ExplorerNode
    undo: RegisterAction[]
    rename: {
        active: boolean
        target: ExplorerNode
    }
    updated: string[]
    create: {
        active: boolean
        name: string
        nodeType: "file" | "folder"
    }
}

export interface IExplorerState {
    // Open workspace
    rootFolder: IFolderState

    expandedFolders: ExpandedFolders
    fileToSelect: string
    hasFocus: boolean
    register: IRegisterState
}

export const DefaultExplorerState: IExplorerState = {
    rootFolder: null,
    expandedFolders: {},
    fileToSelect: null,
    hasFocus: false,
    register: DefaultRegisterState,
}

export interface IUndoAction {
    type: "UNDO"
}

export interface IUndoSuccessAction {
    type: "UNDO_SUCCESS"
}

export interface IUndoFailAction {
    type: "UNDO_FAIL"
    reason: string
}

export interface IYankAction {
    type: "YANK"
    path: string
    target: ExplorerNode
}

export interface IPasteAction {
    type: "PASTE"
    target: ExplorerNode
    pasted: ExplorerNode[]
    sources: ExplorerNode[]
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
    reason: string
}

export interface IClearRegisterAction {
    type: "CLEAR_REGISTER"
    ids: string[]
}

export interface IExpandDirectoryAction {
    type: "EXPAND_DIRECTORY"
    directoryPath: string
}

export interface IRefreshAction {
    type: "REFRESH"
}

export interface ISetRootDirectoryAction {
    type: "SET_ROOT_DIRECTORY"
    rootPath: string
}

export interface ICollapseDirectory {
    type: "COLLAPSE_DIRECTORY"
    directoryPath: string
}

export interface IExpandDirectoryResult {
    type: "EXPAND_DIRECTORY_RESULT"
    directoryPath: string
    children: FolderOrFile[]
}

export interface ISelectFileAction {
    type: "SELECT_FILE"
    filePath: string
}

export interface ISelectFilePendingAction {
    type: "SELECT_FILE_PENDING"
    filePath: string
}

export interface ISelectFileSuccessAction {
    type: "SELECT_FILE_SUCCESS"
}

export interface ISelectFileFailAction {
    type: "SELECT_FILE_FAIL"
    reason: string
}

export interface IEnterAction {
    type: "ENTER"
}

export interface ILeaveAction {
    type: "LEAVE"
}

export interface IPasteFailAction {
    type: "PASTE_FAIL"
    reason: string
}

export interface IClearUpdateAction {
    type: "CLEAR_UPDATE"
}

export interface ICreateNodeStartAction {
    type: "CREATE_NODE_START"
    nodeType: "file" | "folder"
}

export interface ICreateNodeCancelAction {
    type: "CREATE_NODE_CANCEL"
}

export interface ICreateNodeCommitAction {
    type: "CREATE_NODE_COMMIT"
    name: string
}

export interface ICreateNodeFailAction {
    type: "CREATE_NODE_FAIL"
    reason: string
}

export interface ICreateNodeSuccessAction {
    type: "CREATE_NODE_SUCCESS"
    nodeType: "file" | "folder"
    name: string
}

export interface IPasteSuccessAction {
    type: "PASTE_SUCCESS"
    moved: IMovedNodes[]
}

export interface IRenameStartAction {
    type: "RENAME_START"
    target: ExplorerNode
    active: boolean
}

export interface IRenameSuccessAction {
    type: "RENAME_SUCCESS"
    source: string
    destination: string
    targetType: string
}

export interface IRenameFailAction {
    type: "RENAME_FAIL"
    reason: string
}

export interface ICancelRenameAction {
    type: "RENAME_CANCEL"
}

export interface IRenameCommitAction {
    type: "RENAME_COMMIT"
    target: ExplorerNode
    newName: string
}

export interface INotificationSentAction {
    type: "NOTIFICATION_SENT"
    typeOfNotification: string
}

export interface IMovedNodes {
    node: ExplorerNode
    destination: string
}

export type ExplorerAction =
    | IEnterAction
    | ILeaveAction
    | IExpandDirectoryResult
    | ICollapseDirectory
    | ISetRootDirectoryAction
    | IExpandDirectoryAction
    | IRenameStartAction
    | IRenameSuccessAction
    | IRenameFailAction
    | IRenameCommitAction
    | ICancelRenameAction
    | IDeleteFailAction
    | IRefreshAction
    | IDeleteAction
    | IDeleteSuccessAction
    | IYankAction
    | IPasteAction
    | IPasteFailAction
    | IPasteSuccessAction
    | IClearUpdateAction
    | IClearRegisterAction
    | IUndoAction
    | IUndoSuccessAction
    | IUndoFailAction
    | ICreateNodeStartAction
    | ICreateNodeFailAction
    | ICreateNodeCancelAction
    | ICreateNodeCommitAction
    | ICreateNodeSuccessAction
    | INotificationSentAction
    | ISelectFileAction
    | ISelectFilePendingAction
    | ISelectFileSuccessAction
    | ISelectFileFailAction

// Helper functions for Updating state ========================================================
export const removePastedNode = (nodeArray: ExplorerNode[], ids: string[]): ExplorerNode[] =>
    nodeArray.filter(node => !ids.includes(node.id))

export const removeUndoItem = (undoArray: RegisterAction[]): RegisterAction[] =>
    undoArray.slice(0, undoArray.length - 1)

const getSourceAndDestPaths = (source: ExplorerNode, dest: ExplorerNode) => {
    const sourcePath = getPathForNode(source)
    const destPath = dest.type === "file" ? path.dirname(dest.filePath) : getPathForNode(dest)
    const destination = path.join(destPath, path.basename(sourcePath))
    return { source: sourcePath, destination }
}

// Do not add un-undoable action to the undo list
export const shouldAddDeletion = (action: IDeleteSuccessAction) => (action.persist ? [action] : [])

type Updates =
    | IPasteSuccessAction
    | IDeleteSuccessAction
    | IUndoSuccessAction
    | IRenameSuccessAction
    | ICreateNodeSuccessAction

export const getUpdatedNode = (action: Updates, state?: IRegisterState): string[] => {
    switch (action.type) {
        case "PASTE_SUCCESS":
            return action.moved.map(node => node.destination)
        case "DELETE_SUCCESS":
            return [getPathForNode(action.target)]
        case "RENAME_SUCCESS":
            return [action.destination]
        case "CREATE_NODE_SUCCESS":
            return [action.name]
        case "UNDO_SUCCESS":
            const lastAction = last(state.undo)

            if (lastAction.type === "DELETE_SUCCESS") {
                return [getPathForNode(lastAction.target)]
            } else if (lastAction.type === "PASTE") {
                return lastAction.pasted.map(node => getPathForNode(node))
            } else if (lastAction.type === "RENAME_SUCCESS") {
                return [lastAction.source]
            }

            return []
        default:
            return []
    }
}

const shouldExpandDirectory = (targets: ExplorerNode[]): IExpandDirectoryAction[] =>
    targets
        .map(target => target.type !== "file" && Actions.expandDirectory(getPathForNode(target)))
        .filter(Boolean)

export const getPathForNode = (node: ExplorerNode) => {
    if (!node) {
        return null
    } else if (node.type === "file") {
        return node.filePath
    } else if (node.type === "folder") {
        return node.folderPath
    } else {
        return node.name
    }
}

// Strongly typed actions/action-creators to be used in multiple epics

const Actions = {
    Null: { type: null } as ExplorerAction,

    createNode: (args: { nodeType: "file" | "folder"; name: string }) =>
        ({ type: "CREATE_NODE_SUCCESS", ...args } as ICreateNodeSuccessAction),

    createNodeFail: (reason: string) =>
        ({ type: "CREATE_NODE_FAIL", reason } as ICreateNodeFailAction),

    pasteSuccess: (moved: IMovedNodes[]) =>
        ({ type: "PASTE_SUCCESS", moved } as IPasteSuccessAction),

    pasteFail: (reason: string) => ({ type: "PASTE_FAIL", reason } as IPasteFailAction),

    undoFail: (reason: string) => ({ type: "UNDO_FAIL", reason } as IUndoFailAction),

    undoSuccess: { type: "UNDO_SUCCESS" } as IUndoSuccessAction,

    renameSuccess: (args: {
        source: string
        destination: string
        targetType: string
    }): IRenameSuccessAction => ({
        type: "RENAME_SUCCESS",
        ...args,
    }),

    renameFail: (reason: string) => ({ type: "RENAME_FAIL", reason } as IRenameFailAction),

    paste: { type: "PASTE" } as IPasteAction,

    refresh: { type: "REFRESH" } as IRefreshAction,

    deleteFail: (reason: string) => ({ type: "DELETE_FAIL", reason } as IDeleteFailAction),

    clearRegister: (ids: string[]) => ({ type: "CLEAR_REGISTER", ids } as IClearRegisterAction),

    clearUpdate: { type: "CLEAR_UPDATE" } as IClearUpdateAction,

    deleteSuccess: (target: ExplorerNode, persist: boolean): IDeleteSuccessAction => ({
        type: "DELETE_SUCCESS",
        target,
        persist,
    }),

    notificationSent: (typeOfNotification: string): INotificationSentAction => ({
        type: "NOTIFICATION_SENT",
        typeOfNotification,
    }),

    expandDirectory: (directoryPath: string): IExpandDirectoryAction => ({
        type: "EXPAND_DIRECTORY",
        directoryPath,
    }),

    expandDirectoryResult: (
        pathToExpand: string,
        sortedFilesAndFolders: FolderOrFile[],
    ): ExplorerAction => {
        return {
            type: "EXPAND_DIRECTORY_RESULT",
            directoryPath: pathToExpand,
            children: sortedFilesAndFolders,
        }
    },
}

// Yank, Paste Delete register =============================
// The undo register is essentially a list of past actions
// => [paste, delete, paste], when an action is carried out
// it is added to the back of the stack when an undo is triggered
// it is removed.
// The most recently actioned node(s) path(s) are set to the value of
// the updated field, this is used to animate updated fields,
// Updates are cleared shortly after to prevent re-animating

export const yankRegisterReducer: Reducer<IRegisterState> = (
    state: IRegisterState = DefaultRegisterState,
    action: ExplorerAction,
) => {
    switch (action.type) {
        case "CREATE_NODE_START":
            return {
                ...state,
                create: {
                    active: true,
                    name: null,
                    nodeType: action.nodeType,
                },
            }
        case "CREATE_NODE_FAIL":
        case "CREATE_NODE_CANCEL":
            return {
                ...state,
                create: {
                    active: false,
                    name: null,
                    nodeType: null,
                },
            }
        case "CREATE_NODE_SUCCESS":
            return {
                ...state,
                create: {
                    active: false,
                    name: null,
                    nodeType: null,
                },
                updated: getUpdatedNode(action),
                undo: [...state.undo, action],
            }
        case "RENAME_START":
            return {
                ...state,
                rename: {
                    active: true,
                    target: action.target,
                },
            }
        case "RENAME_CANCEL":
            return {
                ...state,
                rename: {
                    active: false,
                    target: null,
                },
            }
        case "RENAME_SUCCESS":
            return {
                ...state,
                undo: [...state.undo, action],
                updated: getUpdatedNode(action),
                rename: {
                    active: false,
                    target: null,
                },
            }
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
        case "PASTE_SUCCESS":
            return {
                ...state,
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
        case "CLEAR_UPDATE":
            return {
                ...state,
                updated: null,
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

export const selectFileReducer: Reducer<string> = (
    state: string = null,
    action: ExplorerAction,
) => {
    switch (action.type) {
        case "SELECT_FILE_PENDING":
            return action.filePath
        case "SELECT_FILE_SUCCESS":
            return null
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
        fileToSelect: selectFileReducer(state.fileToSelect, action),
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

// Send Notifications ==================================================
interface INotificationDetails {
    title: string
    details: string
    level?: NotificationLevel
}

const sendExplorerNotification = (
    { title, details, level = "success" }: INotificationDetails,
    notifications: Notifications,
) => {
    const notification = notifications.createItem()
    notification.setContents(title, details)
    notification.setLevel(level)
    notification.setExpiration(5_000)
    notification.show()
}

interface MoveNotificationArgs {
    type: string
    name: string
    destination: string
    notifications: Notifications
}
const moveNotification = ({ type, name, destination, notifications }: MoveNotificationArgs) =>
    sendExplorerNotification(
        {
            title: `${capitalize(type)} Moved`,
            details: `Successfully moved ${name} to ${destination}`,
        },
        notifications,
    )
interface SendNotificationArgs {
    name: string
    type: string
    notifications: Notifications
}
const deletionNotification = ({ type, name, notifications }: SendNotificationArgs): void =>
    sendExplorerNotification(
        {
            title: `${capitalize(type)} deleted`,
            details: `${path.basename(name)} was deleted successfully`,
        },
        notifications,
    )

interface RenameNotificationArgs {
    type: string
    source: string
    destination: string
    notifications: Notifications
}

const renameNotification = ({
    notifications,
    type,
    source,
    destination,
}: RenameNotificationArgs): void =>
    sendExplorerNotification(
        {
            title: `${capitalize(type)} renamed successfully`,
            details: `${path.basename(source)} renamed to ${path.basename(destination)}`,
        },
        notifications,
    )

interface CreationNotificationArgs {
    notifications: Notifications
    type: "file" | "folder"
    name: string
}

const creationNotification = ({ notifications, type, name }: CreationNotificationArgs): void =>
    sendExplorerNotification(
        {
            title: `${capitalize(type)} created successfully`,
            details: `${name} created`,
        },
        notifications,
    )

interface ErrorNotificationArgs {
    type: string
    reason: string
    notifications: Notifications
}

const errorNotification = ({ type, reason, notifications }: ErrorNotificationArgs): void =>
    sendExplorerNotification(
        {
            title: `${capitalize(type)} Failed`,
            details: reason,
            level: "warn",
        },
        notifications,
    )

interface Dependencies {
    fileSystem: IFileSystem
    notifications: Notifications
}

// EPICS =============================================================
type ExplorerEpic = Epic<ExplorerAction, IExplorerState, Dependencies>

export const pasteEpic: ExplorerEpic = (action$, store, { fileSystem }) =>
    action$.ofType("PASTE").mergeMap(({ target, pasted }: IPasteAction) => {
        const ids = pasted.map(item => item.id)
        const clearRegister = Actions.clearRegister(ids)

        return forkJoin(
            pasted.map(async yankedItem => {
                const { source, destination } = getSourceAndDestPaths(yankedItem, target)
                await fileSystem.move(source, destination)
                return { node: yankedItem, destination }
            }),
        )
            .flatMap(moved => {
                return [
                    clearRegister,
                    ...shouldExpandDirectory([target]),
                    Actions.refresh,
                    Actions.pasteSuccess(moved),
                ]
            })
            .catch(error => {
                Log.warn(error)
                return [clearRegister, Actions.pasteFail(error.message)]
            })
    })

const successActions = (maybeDirsNodes: ExplorerNode[] = []) => [
    Actions.undoSuccess,
    ...shouldExpandDirectory(maybeDirsNodes),
    Actions.refresh,
]

const persistOrDeleteNode = async (
    filepath: string,
    fileSystem: IFileSystem,
    persist = true,
): Promise<void> => {
    const maxSize = configuration.getValue("explorer.maxUndoFileSizeInBytes")
    const persistEnabled = configuration.getValue("explorer.persistDeletedFiles")
    const canPersistNode = await fileSystem.canPersistNode(filepath, maxSize)
    persistEnabled && persist && canPersistNode
        ? await fileSystem.persistNode(filepath)
        : await fileSystem.deleteNode(filepath)
}

export const undoEpic: ExplorerEpic = (action$, store, { fileSystem }) =>
    action$.ofType("UNDO").mergeMap(action => {
        const {
            register: { undo },
        } = store.getState()
        const lastAction = last(undo)

        switch (lastAction.type) {
            case "PASTE":
                const { pasted, target: dir, sources } = lastAction
                const filesAndFolders = pasted.map(file => getSourceAndDestPaths(file, dir))
                return fromPromise(fileSystem.moveNodesBack(filesAndFolders))
                    .flatMap(() => successActions(sources))
                    .catch(error => {
                        Log.warn(error)
                        return [Actions.undoFail("Sorry we can't undo the laste paste action")]
                    })

            case "DELETE_SUCCESS":
                const { target } = lastAction
                return lastAction.persist
                    ? fromPromise(fileSystem.restoreNode(getPathForNode(target)))
                          .flatMap(() => successActions([target]))
                          .catch(error => {
                              Log.warn(error)
                              return [Actions.undoFail("The last deletion cannot be undone, sorry")]
                          })
                    : [Actions.undoFail("The last deletion cannot be undone, sorry")]

            case "RENAME_SUCCESS":
                const { source, destination } = lastAction
                return fromPromise(fileSystem.move(destination, source))
                    .flatMap(() => successActions())
                    .catch(error => {
                        Log.warn(error)
                        return [Actions.undoFail("The last rename could not be undone, sorry")]
                    })

            case "CREATE_NODE_SUCCESS":
                return fromPromise(persistOrDeleteNode(lastAction.name, fileSystem))
                    .flatMap(() => successActions())
                    .catch(error => {
                        Log.warn(error)
                        return [
                            Actions.undoFail(
                                "The last file/folder creation could not be undone, sorry",
                            ),
                        ]
                    })
            default:
                return [Actions.undoFail("Sorry we can't undo the last action")]
        }
    })

export const deleteEpic: ExplorerEpic = (action$, store, { fileSystem }) =>
    action$.ofType("DELETE").mergeMap((action: IDeleteAction) => {
        const { target, persist } = action
        const filepath = getPathForNode(target)

        return fromPromise(persistOrDeleteNode(filepath, fileSystem, persist))
            .flatMap(() => [Actions.deleteSuccess(target, persist), Actions.refresh])
            .catch(error => {
                Log.warn(error)
                return [Actions.deleteFail(error.message)]
            })
    })

export const renameEpic: ExplorerEpic = (action$, store, { fileSystem }) =>
    action$.ofType("RENAME_COMMIT").mergeMap(({ newName, target }: IRenameCommitAction) => {
        const source = getPathForNode(target)
        const destination = path.join(path.dirname(source), newName)
        return fromPromise(fileSystem.move(source, destination))
            .flatMap(() => [
                Actions.renameSuccess({ source, destination, targetType: target.type }),
                Actions.refresh,
            ])
            .catch(error => {
                Log.warn(error)
                return [Actions.renameFail(error.message)]
            })
    })

export const clearYankRegisterEpic: ExplorerEpic = (action$, store) =>
    action$.ofType("YANK").mergeMap((action: IYankAction) => {
        const oneMinute = 60_000
        return timer(oneMinute).mapTo(Actions.clearRegister([action.target.id]))
    })

export const clearUpdateEpic: ExplorerEpic = (action$, store) =>
    action$
        .ofType("PASTE_SUCCESS", "UNDO_SUCCESS", "DELETE_SUCCESS")
        .mergeMap(() => timer(2_000).mapTo(Actions.clearUpdate))

const refreshEpic: ExplorerEpic = (action$, store) =>
    action$
        .ofType("REFRESH")
        .auditTime(300)
        .mergeMap(() => {
            const state = store.getState()

            return Object.keys(state.expandedFolders).map(p => {
                return Actions.expandDirectory(p)
            })
        })

const expandDirectoryEpic: ExplorerEpic = (action$, store, { fileSystem }) =>
    action$.ofType("EXPAND_DIRECTORY").flatMap(async (action: ExplorerAction) => {
        if (action.type !== "EXPAND_DIRECTORY") {
            return Actions.Null
        }

        const pathToExpand = action.directoryPath

        const filesAndFolders = await fileSystem.readdir(pathToExpand)

        const sortedFilesAndFolders = filesAndFolders.sort(sortFilesAndFoldersFunc)

        return Actions.expandDirectoryResult(pathToExpand, sortedFilesAndFolders)
    })

export const selectFileEpic: ExplorerEpic = (action$, store, { fileSystem }) =>
    action$.ofType("SELECT_FILE").mergeMap(({ filePath }: ISelectFileAction): ExplorerAction[] => {
        const rootPath = store.getState().rootFolder.fullPath
        // Normalize, e.g. to remove trailing slash so that subsequent string comparisons work.
        filePath = path.format(path.parse(path.normalize(filePath)))
        // Can only select files in the workspace.
        if (!filePath.startsWith(rootPath)) {
            const failure: ISelectFileFailAction = {
                type: "SELECT_FILE_FAIL",
                reason: `File is not in workspace: ${filePath}`,
            }
            return [failure]
        }
        const relDirectoryPath = path.relative(rootPath, path.dirname(filePath))
        const directories = relDirectoryPath.split(path.sep)
        const actions = []

        // Expand each directory in turn from the project root down to the file we want.
        for (let dirNum = 1; dirNum <= directories.length; dirNum++) {
            const relParentDirectoryPath = directories.slice(0, dirNum).join(path.sep)
            const parentDirectoryPath = path.join(rootPath, relParentDirectoryPath)
            actions.push(Actions.expandDirectory(parentDirectoryPath))
        }
        // Update the state with the file path we want the VimNaviator to select.
        const pending: ISelectFilePendingAction = { type: "SELECT_FILE_PENDING", filePath }
        actions.push(pending)
        return actions
    })

export const createNodeEpic: ExplorerEpic = (action$, store, { fileSystem }) =>
    action$.ofType("CREATE_NODE_COMMIT").mergeMap(({ name }: ICreateNodeCommitAction) => {
        const {
            register: {
                create: { nodeType },
            },
        } = store.getState()
        const shouldExpand = Actions.expandDirectory(path.dirname(name))
        const createFileOrFolder =
            nodeType === "file" ? fileSystem.writeFile(name) : fileSystem.mkdir(name)
        return fromPromise(createFileOrFolder)
            .flatMap(() => [Actions.createNode({ nodeType, name }), shouldExpand, Actions.refresh])
            .catch(error => [Actions.createNodeFail(error.message)])
    })

export const notificationEpic: ExplorerEpic = (action$, store, { notifications }) =>
    action$
        .ofType(
            "PASTE_SUCCESS",
            "DELETE_SUCCESS",
            "RENAME_SUCCESS",
            "CREATE_NODE_SUCCESS",
            "RENAME_FAIL",
            "PASTE_FAIL",
            "DELETE_FAIL",
            "CREATE_NODE_FAIL",
            "SELECT_FILE_FAIL",
        )
        .map(action => {
            switch (action.type) {
                case "PASTE_SUCCESS":
                    action.moved.map(item =>
                        moveNotification({
                            notifications,
                            type: item.node.type,
                            name: item.node.name,
                            destination: item.destination,
                        }),
                    )
                    return Actions.notificationSent(action.type)
                case "DELETE_SUCCESS":
                    deletionNotification({
                        notifications,
                        type: action.target.type,
                        name: action.target.name,
                    })
                    return Actions.notificationSent(action.type)
                case "RENAME_SUCCESS":
                    renameNotification({
                        notifications,
                        type: action.targetType,
                        source: action.source,
                        destination: action.destination,
                    })
                    return Actions.notificationSent(action.type)
                case "CREATE_NODE_SUCCESS":
                    creationNotification({
                        notifications,
                        type: action.nodeType,
                        name: action.name,
                    })
                    return Actions.notificationSent(action.type)
                case "PASTE_FAIL":
                case "DELETE_FAIL":
                case "RENAME_FAIL":
                case "CREATE_NODE_FAIL":
                case "SELECT_FILE_FAIL":
                    const [type] = action.type.split("_")
                    errorNotification({
                        type,
                        notifications,
                        reason: action.reason,
                    })
                    return Actions.notificationSent(action.type)
                default:
                    return Actions.Null
            }
        })

interface ICreateStore {
    fileSystem?: IFileSystem
    notifications: Notifications
}

export const createStore = ({
    fileSystem = OniFileSystem,
    notifications,
}: ICreateStore): Store<IExplorerState> => {
    return createReduxStore("Explorer", reducer, DefaultExplorerState, [
        createEpicMiddleware<ExplorerAction, IExplorerState, Dependencies>(
            combineEpics(
                refreshEpic,
                setRootDirectoryEpic,
                createNodeEpic,
                clearUpdateEpic,
                clearYankRegisterEpic,
                renameEpic,
                pasteEpic,
                undoEpic,
                deleteEpic,
                expandDirectoryEpic,
                selectFileEpic,
                notificationEpic,
            ),
            { dependencies: { fileSystem, notifications } },
        ),
    ])
}
