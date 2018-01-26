/**
 * FileMappings.ts
 *
 * Shared code / utilities for mapping files
 */

import * as path from "path"

export interface IFileMapping {
    sourceFolder: string
    sourceFilesGlob?: string

    mappedFolder: string
    mappedFileName: string
}

export const getMappedFile = (
    rootFolder: string,
    filePath: string,
    mappings: IFileMapping[],
): string | null => {
    const mappingsThatApply = mappings.filter(m => doesMappingMatchFile(rootFolder, filePath, m))

    if (mappingsThatApply.length === 0) {
        return null
    }

    const mapping = mappingsThatApply[0]

    return getMappedFileFromMapping(rootFolder, filePath, mapping)
}

export const doesMappingMatchFile = (
    rootFolder: string,
    filePath: string,
    mapping: IFileMapping,
): boolean => {
    return filePath.indexOf(path.join(rootFolder, mapping.sourceFolder)) === 0
}

export const getMappedFileFromMapping = (
    rootFolder: string,
    filePath: string,
    mapping: IFileMapping,
): string | null => {
    const fullSourceRoot = path.join(rootFolder, mapping.sourceFolder)
    const difference = getPathDifference(fullSourceRoot, path.dirname(filePath))

    // Resolve the variables in the file path, like `${fileName}`
    const resolvedMappedFile = replaceVariablesInFileName(mapping.mappedFileName, filePath)

    const mappedFile = path.join(rootFolder, mapping.mappedFolder, difference, resolvedMappedFile)
    return mappedFile
}

export const replaceVariablesInFileName = (
    mappingFileNameWithVariables: string,
    originalFilePath: string,
): string => {
    const originalFileNameWithExtension = path.basename(originalFilePath)
    const originalExtension = path.extname(originalFileNameWithExtension)

    const originalFileNameWithoutExtension = path.basename(originalFilePath, originalExtension)

    let ret = mappingFileNameWithVariables

    // Resolve '${fileName}' variable
    ret = ret.split("${fileName}").join(originalFileNameWithoutExtension) // tslint:disable-line

    return ret
}

export const getPathDifference = (path1: string, path2: string): string => {
    const path1Parts = splitPath(path1) || []
    const path2Parts = splitPath(path2) || []

    const deltaPathParts = []

    const basePathParts = path1Parts.length < path2Parts.length ? path1Parts : path2Parts
    const diffPathParts = path1Parts.length < path2Parts.length ? path2Parts : path1Parts

    let idx = 0
    let isEqual: boolean = true
    while (idx < diffPathParts.length) {
        if (idx >= basePathParts.length) {
            deltaPathParts.push(diffPathParts[idx])
        } else {
            if (isEqual && basePathParts[idx] === diffPathParts[idx]) {
                // just continue
            } else {
                isEqual = false
                deltaPathParts.push(diffPathParts[idx])
            }
        }

        idx++
    }

    return path.join.apply(path, deltaPathParts)
}

export const splitPath = (fullPath: string): string[] => {
    return path.normalize(fullPath).split(path.sep)
}
