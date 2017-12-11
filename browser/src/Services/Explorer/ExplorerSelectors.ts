/**
 * ExplorerSelectors.ts
 *
 * Selectors for the explorer state
 */

import * as flatten from "lodash/flatten"

import { ExpandedFolders, FolderOrFile, IExplorerState } from "./ExplorerStore"

export type ExplorerNode = {
    id: string,
    type: "container",
    expanded: boolean,
    name: string,
} | {
    id: string,
    type: "folder",
    folderPath: string,
    expanded: boolean,
}  | {
    id: string,
    type: "file",
    filePath: string,
    modified: boolean,
}

export const mapStateToNodeList = (state: IExplorerState): ExplorerNode[] => {
    let ret: ExplorerNode[] = []

    ret.push({
        id: "opened",
        type: "container",
        expanded: true,
        name: "Opened Files",
    })

    const openedFiles: ExplorerNode[] = state.openedFiles.map((of) => ({
        type: "file",
        id: "opened:" + of.filePath,
        filePath: of.filePath,
        modified: of.modified,
    } as ExplorerNode))

    ret = [...ret, ...openedFiles]

    if (!state.rootFolder) {
        return ret
    }

    ret.push({
        id: "explorer",
        type: "container",
        expanded: true,
        name: state.rootFolder.fullPath,
    })

    const expandedTree = flattenFolderTree(state.rootFolder, [], state.expandedFolders)

    // The root node is included in the output, so we'll remove it
    const [, ...remainingTree] = expandedTree

    ret = [...ret, ...remainingTree]
    return ret
}

export const flattenFolderTree = (folderTree: FolderOrFile, currentList: ExplorerNode[], expandedFolders: ExpandedFolders): ExplorerNode[] => {
    switch (folderTree.type) {
        case "file":
            const file: ExplorerNode = {
                type: "file",
                id: "explorer:" + folderTree.fullPath,
                filePath: folderTree.fullPath,
                modified: false,
            }
            return [...currentList, file]
        case "folder":
            const expanded = !!expandedFolders[folderTree.fullPath]

            const folder: ExplorerNode = {
                type: "folder",
                id: "explorer:" + folderTree.fullPath,
                folderPath: folderTree.fullPath,
                expanded,
            }

            const folderChildren = expandedFolders[folderTree.fullPath] || []
            const children = flatten(folderChildren.map((c) => flattenFolderTree(c, [], expandedFolders)))

            return [...currentList, folder, ...children]
        default:
            return []
    }
}
