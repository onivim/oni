import * as _ from "lodash"
import * as Q from "q"

import { INeovimInstance } from "./../NeovimInstance"
import * as Performance from "./../Performance"

import { ITask, ITaskProvider } from "./Tasks"

/**
 * Window that shows terminal output
 */

export class Errors implements ITaskProvider {
    private _neovimInstance: INeovimInstance
    private _errors: { [fileName: string]: Oni.Plugin.Diagnostics.Error[] } = {}
    private _debouncedSetQuickFix: () => void

    constructor(neovimInstance: INeovimInstance) {
        this._neovimInstance = neovimInstance

        this._debouncedSetQuickFix = _.debounce(() => {
            Performance.mark("_setQuickFixErrors - begin")
            this._setQuickFixErrors()
            Performance.mark("_setQuickFixErrors - end")
        }, 250)
    }

    public setErrors(fileName: string, errors: Oni.Plugin.Diagnostics.Error[]) {
        this._errors[fileName] = errors

        this._debouncedSetQuickFix()
    }

    public getTasks(): Q.Promise<ITask[]> {
        const showErrorTask: ITask = {
            name: "Show Errors",
            detail: "Open quickfix window and show error details",
            callback: () => this._neovimInstance.command("copen"),
        }

        const tasks = [showErrorTask]
        return Q(tasks)
    }

    private _setQuickFixErrors(): void {
        const arrayOfErrors = _.keys(this._errors).map((filename) => {
            return this._errors[filename].map((e) => ({
                ...e,
                filename,
            }))
        })

        const flattenedErrors = _.flatten(arrayOfErrors)
        const errors = flattenedErrors.map((e) => <any>({
            filename: e.filename,
            col: e.startColumn || 0,
            lnum: e.lineNumber,
            text: e.text,
        }))

        this._neovimInstance.quickFix.setqflist(errors, "Errors", " ")
    }
}
