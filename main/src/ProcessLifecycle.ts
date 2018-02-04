import * as fs from "fs"
import * as net from "net"
import * as os from "os"
import * as path from "path"

import { app } from "electron"

import * as Log from "./Log"

let isPrimaryInstance = false
let isAppReady = false
const pendingAppReadyCallbacks = []

app.on("ready", () => {
    isAppReady = true

    pendingAppReadyCallbacks.forEach(callback => callback())
})

app.on("will-quit", () => {
    Log.info("will-quit")

    if (isPrimaryInstance) {
        const socketPath = getSocketPath()
        deleteSocketFile(socketPath)
    } else {
        Log.info("not deleting socket file because not primary instance.")
    }
})

const waitForAppReady = callback => {
    if (isAppReady) {
        callback()
    } else {
        pendingAppReadyCallbacks.push(callback)
    }
}

// Inspired by atom's workaround in `atom-application.coffee`
export const makeSingleInstance = (options, callbackFunction) => {
    const socketPath = getSocketPath()

    const initializePrimaryInstance = () => {
        Log.info("Initializing primary instance.")
        isPrimaryInstance = true

        waitForAppReady(() => callbackFunction(options))

        deleteSocketFile(socketPath)

        const server = net.createServer(connection => {
            let data = ""

            connection.on("data", chunk => {
                data = data + chunk
            })

            connection.on("end", () => {
                const newProcessOpts = JSON.parse(data)
                waitForAppReady(() => callbackFunction(newProcessOpts))
            })
        })

        server.listen(socketPath)
    }

    // If the file doesn't exist, and this is not windows,
    // that means this is definitely the first / primary instance
    if (process.platform !== "win32") {
        if (!fs.existsSync(socketPath)) {
            Log.info("Socket file does not exist.")
            initializePrimaryInstance()
            return
        }
    }

    // Try writing to the socket. If this is not the first process,
    // this will succeed and we'll pass our options along...
    const client = net.connect(socketPath, () => {
        client.write(JSON.stringify(options), () => {
            Log.info("Connecting to socket and successfully wrote. Quitting.")
            client.end()
            app.quit()
        })
    })

    // ...otherwise, if it doesn't succeed, that means
    // we're the first instance
    client.on("error", () => {
        Log.info("Error when connecting socket")
        initializePrimaryInstance()
    })
}

const deleteSocketFile = socketPath => {
    if (process.platform === "win32") {
        return
    }

    if (fs.existsSync(socketPath)) {
        Log.info("Attemping to delete socket file...")
        try {
            fs.unlinkSync(socketPath)
            Log.info("Socket file was deleted")
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
