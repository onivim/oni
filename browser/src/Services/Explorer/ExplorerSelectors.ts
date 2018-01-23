/**
 * ExplorerSelectors.ts
 *
 * Selectors for the explorer state
 */

import * as path from "path"

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
    name: string,
    indentationLevel: number,
}  | {
    id: string,
    type: "file",
    filePath: string,
    modified: boolean,
    name: string,
    indentationLevel: number,
}

export const isPathExpanded = (state: IExplorerState, pathToCheck: string): boolean => {
    return !!state.expandedFolders[pathToCheck]
}

export const mapStateToNodeList = (state: IExplorerState): ExplorerNode[] => {
    let ret: ExplorerNode[] = []

//     ret.push({
//         id: "opened",
//         type: "container",
//         expanded: true,
//         name: "Opened Files",
//     })

//     const openedFiles: ExplorerNode[] = Object.keys(state.openedFiles)
//         .filter(filePath => !!filePath)
//         .map(filePath => ({
//         type: "file",
//         id: "opened:" + filePath,
//         filePath,
//         name: path.basename(filePath),
//         modified: false, // TODO
//         indentationLevel: 0,
//     } as ExplorerNode))

//     ret = [...ret, ...openedFiles]

    if (!state.rootFolder) {
        return ret
    }

    ret.push({
        id: "explorer",
        type: "container",
        expanded: true,
        name: state.rootFolder.fullPath,
    })

    const expandedTree = flattenFolderTree(state.rootFolder, [], state.expandedFolders, 0)

    // The root node is included in the output, so we'll remove it
    const [, ...remainingTree] = expandedTree

    ret = [...ret, ...remainingTree]
    return ret
}

export const flattenFolderTree = (folderTree: FolderOrFile, currentList: ExplorerNode[], expandedFolders: ExpandedFolders, indentationLevel: number): ExplorerNode[] => {
    switch (folderTree.type) {
        case "file":
            const file: ExplorerNode = {
                type: "file",
                name: path.basename(folderTree.fullPath),
                id: "explorer:" + folderTree.fullPath,
                filePath: folderTree.fullPath,
                modified: false,
                indentationLevel,
            }
            return [...currentList, file]
        case "folder":
            const expanded = !!expandedFolders[folderTree.fullPath]

            const folder: ExplorerNode = {
                type: "folder",
                id: "explorer:" + folderTree.fullPath,
                folderPath: folderTree.fullPath,
                name: path.basename(folderTree.fullPath),
                expanded,
                indentationLevel,
            }

            const folderChildren = expandedFolders[folderTree.fullPath] || []
            const children = flatten(folderChildren.map((c) => flattenFolderTree(c, [], expandedFolders, indentationLevel + 1)))

            return [...currentList, folder, ...children]
        default:
            return []
    }
}
