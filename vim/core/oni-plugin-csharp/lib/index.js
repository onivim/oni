const fs = require("fs")
const path = require("path")
const childProcess = require("child_process")

const _ = require("lodash")
const rpc = require("vscode-jsonrpc")

const activate = (Oni) => {

    const omniSharpLangServerPath = path.join(__dirname, "..", "..", "..", "..", "node_modules", "omnisharp-client", "languageserver", "server.js")

    const startOptions = {
        module: `${omniSharpLangServerPath}`
    }

    const client = Oni.createLanguageClient(startOptions, (filePath) => {
        return getRootProjectFileAsync(path.dirname(filePath))
            .then((csprojPath) => {
                return {
                    clientName: "omnisharp",
                    rootPath: csprojPath,
                }
            })
    })
}

const getFilesForDirectoryAsync = (fullPath) => {
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
            const proj = _.find(files, (f) => f.indexOf(".csproj") >= 0)

            if (proj) {
                return fullPath
            } else {
                return getRootProjectFileAsync(path.dirname(fullPath))
            }
        })
}

module.exports = {
    activate
}
