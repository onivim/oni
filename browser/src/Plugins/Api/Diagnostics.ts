/**
 * Diagnostics.ts
 *
 * API surface exposed for interacting with error management in plugins
 */

import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"

import * as UI from "./../../UI"

/**
 * API instance for interacting with Oni (and vim)
 */
export class Diagnostics implements Oni.Plugin.Diagnostics.Api {
    public setErrors(key: string, fileName: string, errors: types.Diagnostic[]): void {
        UI.Actions.setErrors(fileName, key, errors)
    }
}
