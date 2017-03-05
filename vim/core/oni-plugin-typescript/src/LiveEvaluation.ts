import * as os from "os"
import * as path from "path"

import * as _ from "lodash"

const findParentDir = require("find-parent-dir") // tslint:disable-line no-var-requires

declare var Oni

/**
 * Get all top-level requires / imports from buffer
 */
export const getCommonImports = (bufferLines: string[]) => {
    return bufferLines.filter((line) => {
        return (line.trim().indexOf("import") === 0 || line.indexOf("require(") >= 0) && line.indexOf("ignore-live") === -1 && line.indexOf("return") === -1
    })
}

export const evaluateBlock = (id: string, fileName: string, code: string) => {
    const vm = require("vm")
    const ts = require("typescript")

    code = ts.transpileModule(code, { target: "ES6" }).outputText

    let compilationError = null
    let script = null
    try {
        script = new vm.Script(code)
    } catch (ex) {
        compilationError = ex.toString()
    }

    if (compilationError) {
        return Promise.resolve({
            id,
            fileName,
            result: null,
            output: null,
            errors: [compilationError],
        })
    }

    const Module = require("module")
    const mod = new Module(fileName)
    const util = require("util")
    const sandbox = {
        exports: {},
        module: mod,
        __filename: fileName,
        __dirname: path.dirname(fileName),
        require: (requirePath) => {
            try {
                const path = require("path")
                // See if this is a 'node_modules' dependency:

                const modulePath = findParentDir.sync(__dirname, path.join("node_modules", requirePath))

                if (modulePath) {
                    requirePath = path.join(modulePath, "node_modules", requirePath)
                }

                return mod.require(requirePath)
            } catch (ex) {
                // TODO: Log require error here
                debugger // tslint:disable-line no-debugger
            }
        },
    }

    let result = null
    let errors = []
    try {
        result = script.runInNewContext(sandbox)
    } catch (ex) {
        errors = [ex.toString()]
    }

    const initialResult = {
        id,
        fileName,
        output: null,
        errors,
    }

    if (result && result.then) {
        return result.then((val) => (_.extend({}, initialResult, {
            result: util.inspect(val),
            variables: util.inspect(sandbox),
        })), (err) => (_.extend({}, initialResult, {
            variables: util.inspect(sandbox),
            errors: [err],
        })))
    } else {
        return Promise.resolve(_.extend({}, initialResult, {
            result: util.inspect(result),
            variables: util.inspect(sandbox),
        }))
    }
}
