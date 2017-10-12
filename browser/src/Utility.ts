/**
 * Utility.ts
 *
 * Grab bag for functions that don't have another home.
 */

import * as fs from "fs"
import * as minimatch from "minimatch"
import * as path from "path"

import * as find from "lodash/find"
import * as isEqual from "lodash/isEqual"
import * as reduce from "lodash/reduce"

/**
 * Use a `node` require instead of a `webpack` require
 * The difference is that `webpack` require will bake the javascript
 * into the module. For most modules, we want the webpack behavior,
 * but for some (like node modules), we want to explicitly require them.
 */

export function nodeRequire(moduleName: string): any {
    return window["require"](moduleName) // tslint:disable-line
}

export const normalizePath = (fileName: string) => fileName.split("\\").join("/")

// String methods

// ReplaceAll adapted from SO:
// https://stackoverflow.com/questions/15604140/replace-multiple-strings-with-multiple-other-strings
export const replaceAll = (str: string, wordsToReplace: { [key: string]: string }) => {
    const re = new RegExp(Object.keys(wordsToReplace).join("|"), "gi")

    return str.replace(re, (matched) => wordsToReplace[matched.toLowerCase()])
}

export const diff = (newObject: any, oldObject: any) => {
    // Return changed properties between newObject and oldObject
    const updatedProperties = reduce(newObject, (result, value, key) => {
        return isEqual(value, oldObject[key]) ? result : [...result, key]
    }, [])

    const keysInNewObject = Object.keys(newObject)
    const deletedProperties = Object.keys(oldObject).filter((key) => keysInNewObject.indexOf(key) === -1)

    return [...updatedProperties, ...deletedProperties]
}

export const doesFileNameMatchGlobPatterns = (fileName: string, globPatterns: string[]): boolean => {

    if (!fileName) {
        return false
    }

    if (!globPatterns || !globPatterns.length) {
        return false
    }

    for (const filePattern of globPatterns) {
        if (minimatch(fileName, filePattern)) {
            return true
        }
    }

    return false
}

export const getRootProjectFileFunc = (patternsToMatch: string[]) => {

    const getFilesForDirectory = (fullPath: string): Promise<string[]> => {
        return new Promise((res, rej) => {
            fs.readdir(fullPath, (err, files) => {
                if (err) {
                    rej(err)
                } else {
                    res(files)
                }
            })
        })
    }

    const getRootProjectFile = async (fullPath: string): Promise<string> => {

        const parentDir = path.dirname(fullPath)

        // Test for root folder
        if (parentDir === fullPath) {
            return Promise.reject("Unable to find root csproj file")
        }

        const files = await getFilesForDirectory(fullPath)
        const proj = find(files, (f) =>  doesFileNameMatchGlobPatterns(f, patternsToMatch))

        if (proj) {
            return fullPath
        } else {
            return getRootProjectFile(path.dirname(fullPath))
        }
    }

    return getRootProjectFile
}
