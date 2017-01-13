import * as _ from "lodash"
import { INeovimInstance } from "./../NeovimInstance"

/**
 * Window that shows terminal output
 */

export class Errors {

    private _neovimInstance: INeovimInstance
    private _errors: { [fileName: string]: Oni.Plugin.Diagnostics.Error[] } = {}

    constructor(neovimInstance: INeovimInstance) {
        this._neovimInstance = neovimInstance
    }

    public setErrors(fileName: string, errors: Oni.Plugin.Diagnostics.Error[]) {
        this._errors[fileName] = errors
    }

    public showErrorsInQuickFix(): void {
        const arrayOfErrors = _.keys(this._errors).map((filename) => {
            return this._errors[filename].map(e => ({
                ...e,
                filename
            }))
        })

        const flattenedErrors = _.flatten(arrayOfErrors)
        const errors = flattenedErrors.map(e => <any>({
            filename: e.filename,
            col: e.startColumn || 0,
            lnum: e.lineNumber,
            text: e.text
        }))

        this._neovimInstance.quickFix.setqflist(errors, "test", " ")
    }
}
