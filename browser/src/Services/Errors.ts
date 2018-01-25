import * as flatten from "lodash/flatten"
import * as keys from "lodash/keys"

import { INeovimInstance } from "./../neovim"

import { ITask, ITaskProvider } from "./Tasks"

import * as types from "vscode-languageserver-types"

/**
 * Window that shows terminal output
 */

export const getColorFromSeverity = (severity: types.DiagnosticSeverity): string => {
    switch (severity) {
        case types.DiagnosticSeverity.Error:
            return "red"
        case types.DiagnosticSeverity.Warning:
            return "yellow"
        case types.DiagnosticSeverity.Information:
        case types.DiagnosticSeverity.Hint:
        default:
            return "gray"
    }
}

export class Errors implements ITaskProvider {
    private _neovimInstance: INeovimInstance
    private _errors: { [fileName: string]: types.Diagnostic[] } = {}

    constructor(neovimInstance: INeovimInstance) {
        this._neovimInstance = neovimInstance
    }

    public setErrors(fileName: string, errors: types.Diagnostic[]) {
        this._errors[fileName] = errors
    }

    public getTasks(): Promise<ITask[]> {
        const showErrorTask: ITask = {
            name: "Show Errors",
            detail: "Open quickfix window and show error details",
            command: "oni.editor.showErrors",

            callback: () => {
                this._setQuickFixErrors()
                this._neovimInstance.command("copen")
            },
        }

        const tasks = [showErrorTask]
        return Promise.resolve(tasks)
    }

    private _setQuickFixErrors(): void {
        const arrayOfErrors = keys(this._errors).map(filename => {
            return this._errors[filename].map(e => ({
                ...e,
                filename,
            }))
        })

        const flattenedErrors = flatten(arrayOfErrors)
        const errors = flattenedErrors.map(
            e =>
                ({
                    filename: e.filename,
                    col: e.range.start.character || 0,
                    lnum: e.range.start.line + 1,
                    text: e.message,
                } as any),
        )

        this._neovimInstance.quickFix.setqflist(errors, "Errors", " ")
    }
}
