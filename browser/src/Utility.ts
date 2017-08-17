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
