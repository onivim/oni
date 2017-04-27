/**
 * index.ts
 *
 * Entry point for ONI's TypeScript Language Service integraiton
 */

/// <reference path="./../../../../definitions/Oni.d.ts" />
/// <reference path="./../../../../node_modules/typescript/lib/protocol.d.ts" />

import * as fs from "fs"
import * as path from "path"

import * as _ from "lodash"

export const activate = (Oni) => {
    const typeScriptLangServerPath = path.join(__dirname, "..", "..", "..", "..", "node_modules", "javascript-typescript-langserver", "lib", "language-server-stdio.js")

    const execCommand = `node ${typeScriptLangServerPath}`

    const client = Oni.createLanguageClient(execCommand, (filePath) => {
        return getRootProjectFileAsync(path.dirname(filePath))
            .then((tsconfigPath) => ({
                clientName: "javascript-typescript",
                rootPath: tsconfigPath,
                capabilities: {
                    highlightProvider: true,
                }
            }))
    })

    const getFilesForDirectoryAsync = (fullPath): Promise<string[]> => {
        return new Promise((resolve, reject) => {
            fs.readdir(fullPath, (err, files) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(files)
                }
            })
        })
    }

    const getRootProjectFileAsync = (fullPath) => {

        const parentDir = path.dirname(fullPath)

        if (parentDir === fullPath) {
            return Promise.reject("Unable to find root csproj file")
        }

        return getFilesForDirectoryAsync(fullPath)
            .then((files) => {
                const proj = _.find(files, (f) => f.indexOf("tsconfig.json") >= 0)

                if (proj) {
                    return fullPath
                } else {
                    return getRootProjectFileAsync(path.dirname(fullPath))
                }
            })
    }
}
