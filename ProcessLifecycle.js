const fs = require("fs")
const net = require("net")
const os = require("os")
const path = require("path")

const { app } = require("electron")
// import * as fs from "fs"
// import * as os from "os"
// import * as path from "path"

let isPrimaryInstance = false


// Inspired by atom's workaround in `atom-application.coffee`
const makeSingleInstance = (options, callbackFunction) => {

    const socketPath = getSocketPath()

    const initializePrimaryInstance = () => {
        console.log("Initializing primary instance.")
        isPrimaryInstance = true
        callbackFunction(options)

        deleteSocketFile(socketPath)

        const server = net.createServer((connection) => {
            let data = ""

            connection.on("data", (chunk) => {
                data = data + chunk
            })

            connection.on("end", () => {
                const options = JSON.parse(data)
                callbackFunction(options)
            })
        })

        server.listen(socketPath)
    }

    // If the file doesn't exist, and this is not windows,
    // that means this is definitely the first / primary instance
    if (process.platform !== "win32") {
        if (!fs.existsSync(socketPath)) {
            console.log("Socket file does not exist.")
            initializePrimaryInstance()
            return
        }
    }

    // Try writing to the socket. If this is not the first process,
    // this will succeed and we'll pass our options along...
    const client = net.connect({ path: socketPath}, () => {
        client.write(JSON.stringify(options), () => {
            console.log("Connecting to socket and successfully wrote. Quitting.")
            client.end()
            app.quit()
        })
    })

    //...otherwise, if it doesn't succeed, that means
    // we're the first instance
    client.on("error", () => {
        console.log("Error when connecting socket")
        initializePrimaryInstance()
    })
}

const quit = () => {
    const socketPath = getSocketPath()
    deleteSocketFile(socketPath)
    app.quit()
}


const deleteSocketFile = (socketPath) => {
    if (process.platform === "win32") {
        return
    }

    if (fs.existsSync(socketPath)) {
        try {
            fs.unlinkSync(socketPath)
        } catch (error) {
            if (error.code === "ENOENT") {
                // In some cases, there can be a race condition here...
            } else {
                throw error
            }
        }

    }
}

const getSocketFileName = () => {
    const userName = getUserName()

    return `onivim-${userName}-${process.arch}`
}

const getSocketPath = () => {

    const socketFile = getSocketFileName()

    if (process.platform === "win32") {
        return `\\\\.\\pipe\\${socketFile}-sock`
    } else {
        return path.join(os.tmpdir(), socketFile + ".sock")
    }

}


const getUserName = () => {
    if (process.platform === "win32") {
        return new Buffer(process.env.USERNAME).toString("base64")
    } else {
        return process.env.USER
    }
}

module.exports = {
	makeSingleInstance,
	quit
}

