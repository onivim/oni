/**
 * index.tsx
 *
 * Entry point for the BrowserWindow process
 */

import { ipcRenderer } from "electron"

import * as App from "./App"

ipcRenderer.on("init", (_evt: any, message: any) => {
    process.chdir(message.workingDirectory)
    App.start(message.args)
})

ipcRenderer.on("execute-command", async (_evt: any, command: string, arg?: any) => {
    const { commandManager } = await import("./Services/CommandManager")
    commandManager.executeCommand(command, arg)
})
