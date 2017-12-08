/**
 * ExplorerSelectors.ts
 *
 * Selectors for the explorer state
 */

import * as flatten from "lodash/flatten"

import { IExplorerState, FolderOrFile } from "./ExplorerStore"

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

    const openedFiles: ExplorerNode[] = state.openedFiles.map((of) => (<ExplorerNode>{
        type: "file",
        id: "opened:" + of.filePath,
        filePath: of.filePath,
        modified: of.modified,
    }))

    ret = [...ret, ...openedFiles]

    ret.push({
        id: "explorer",
        type: "container",
        expanded: true,
        name: state.rootFolder.fullPath,
    })

    const expandedTree = flattenFolderTree(state.rootFolder, [])

    ret = [...ret, ...expandedTree]
    return ret
}

export const flattenFolderTree = (folderTree: FolderOrFile, currentList: ExplorerNode[]): ExplorerNode[] => {
    switch(folderTree.type) {
        case "file":
            const file: ExplorerNode = {
                type: "file",
                id: "explorer:" + folderTree.fullPath,
                filePath: folderTree.fullPath,
                modified: false,
            }
            return [...currentList, file]
        case "folder":
            const folder: ExplorerNode = {
                type: "folder",
                id: "explorer:" + folderTree.fullPath,
                folderPath: folderTree.fullPath,
                expanded: folderTree.expanded,
            }


            let children: ExplorerNode[] = []

            if (folderTree.expanded) {
                // TODO: Flatmap
                children = flatten(folderTree.children.map((c) => flattenFolderTree(c, [])))
            }

            return [...currentList, folder, ...children]
        default:
            return []
    }
}
