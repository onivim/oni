/**
 * Utility.ts
 *
 * Grab bag for functions that don't have another home.
 */

/**
 * Use a `node` require instead of a `webpack` require
 * The difference is that `webpack` require will bake the javascript
 * into the module. For most modules, we want the webpack behavior,
 * but for some (like node modules), we want to explicitly require them.
 */

import * as isEqual from "lodash/isEqual"
import * as reduce from "lodash/reduce"

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
