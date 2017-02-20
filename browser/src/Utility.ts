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
