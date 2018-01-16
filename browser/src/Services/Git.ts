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
    getGitSummary(workspace: string): Promise<git.DiffResult | null>
    getBranch(path?: string): Promise<Error | string>
}

export async function getGitSummary(workspace: string): Promise<git.DiffResult | null> {
    if (!workspace) {
        return null
    }
    const project = await git(workspace)
    const isRepo = await (project as any).checkIsRepo()
    let status = null
    if (isRepo) {
        status = project.diffSummary()
    }
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
