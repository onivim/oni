/**
 * Git.ts
 *
 * Utilities around Git
 */

import { exec } from "child_process"
import * as git from "simple-git/promise"
import { promisify } from "util"
import * as Log from "./../Log"

const execPromise = promisify(exec)

interface IExecOptions {
    cwd?: string
}

interface IStatus extends git.DiffResult {
    modified?: number
}

export interface GitFunctions {
    getGitSummary(workspace: string): Promise<git.DiffResult | null>
    getBranch(path?: string): Promise<Error | string>
    getGitRoot(): Promise<string | null>
}

export async function getGitRoot(): Promise<string | null> {
    try {
        const rootDir = await git().revparse(["--show-toplevel"])
        Log.info(`Git Root Directory is ${rootDir}`)
        return rootDir
    } catch (e) {
        return null
    }
}

export async function getGitSummary(currentDir: string = process.cwd()): Promise<IStatus | null> {
    const isRepo = await git(currentDir).checkIsRepo()
    try {
        return isRepo ? git(currentDir).diffSummary() : null
    } catch (e) {
        Log.warn(`[Oni.Git.Plugin]: ${e.message}`)
        return null
    }
}

export async function getBranch(filePath?: string): Promise<string> {
    const options: IExecOptions = {}
    if (filePath) {
        options.cwd = filePath
    }

    // git().branch()
    const result: any = await execPromise("git rev-parse --abbrev-ref HEAD", options)
    return result
}
