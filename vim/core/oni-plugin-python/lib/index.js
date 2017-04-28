const fs = require("fs")
const path = require("path")
const childProcess = require("child_process")

const _ = require("lodash")
const rpc = require("vscode-jsonrpc")

const activate = (Oni) => {

    // TODO: Remove log file
    const execCommand = `pyls --log-file C://log.txt`

    const client = Oni.createLanguageClient(execCommand, (filePath) => {
        return Promise.resolve({
            clientName: "python",
            // TODO: Remove hardcoded dependency
            rootPath: "C:/python-language-server",
            capabilities: {
                highlightProvider: true
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
