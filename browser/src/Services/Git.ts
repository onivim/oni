/**
 * Git.ts
 *
 * Utilities around Git
 */

import { exec } from "child_process"
import * as git from "simple-git/promise"

interface IExecOptions {
    cwd?: string
}

export interface GitFunctions {
    getGitSummary(): Promise<git.DiffResult>
    getBranch(path?: string): Promise<Error | string>
}

export async function getGitSummary(): Promise<git.DiffResult> {
    const status = await git(process.cwd()).diffSummary()
    return status
}

export function getBranch(path?: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const options: IExecOptions = {}
        if (path) {
            options.cwd = path
        }

        exec("git rev-parse --abbrev-ref HEAD", options, (error: any, stdout: string, stderr: string) => {
            if (error && error.code) {
                reject(new Error(stderr))
            } else {
                resolve(stdout)
            }
        })
    })
}
