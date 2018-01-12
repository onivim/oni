/**
 * FileMappings.ts
 *
 * Shared code / utilities for mapping files
 */

// import * as fs from "fs"

export interface IFileMapping {
    sourceFolder: string
    sourceFilesGlob?: string

    mappedFolder: string
    mappedFileName: string
}

export const getMappedFile = (rootFolder: string, filePath: string, mapping: IFileMapping): string | null => {
    return null
}
