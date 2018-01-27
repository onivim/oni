/**
 * Git.ts
 *
 * Utilities around Git
 */

import { exec } from "child_process"
import * as path from "path"
import * as git from "simple-git/promise"
import { promisify } from "util"
import * as Log from "./../Log"

const execPromise = promisify(exec)

interface IExecOptions {
    cwd?: string
}

export interface GitFunctions {
    getGitSummary(workspace: string): Promise<git.DiffResult | null>
    getBranch(path?: string): Promise<Error | string>
    getGitRoot(): Promise<string | null>
}

export async function getGitRoot(): Promise<string | null> {
    try {
        const rootDir = await (git() as any).revparse(["--show-toplevel"])
        Log.info(`Git Root Directory is ${rootDir}`)
        return path.join(__dirname, rootDir)
    } catch (e) {
        return null
    }
}

export async function getGitSummary(currentDir: string): Promise<git.DiffResult | null> {
    Log.info(`Current Directory is ${currentDir}`)
    let status = null
    if (currentDir) {
        // TODO: .customBinary()
        const project = git(currentDir)
        const isRepo = await project.checkIsRepo()
        if (isRepo) {
            status = await project.diffSummary()
        }
    }
    return status
}

export async function getBranch(filePath?: string): Promise<string> {
    const options: IExecOptions = {}
    if (filePath) {
        options.cwd = filePath
    }

    const result = (await execPromise("git rev-parse --abbrev-ref HEAD", options)) as any
    return result
}
