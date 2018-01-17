/**
 * Git.ts
 *
 * Utilities around Git
 */

import { exec } from "child_process"
import * as path from "path"
import * as git from "simple-git/promise"

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
        return path.join(__dirname, rootDir)
    } catch (e) {
        return null
    }
}

export async function getGitSummary(currentDir: string): Promise<git.DiffResult | null> {
    let status = null
    if (currentDir) {
        const project = git(currentDir)
        const isRepo = await (project as any).checkIsRepo()
        if (isRepo) {
            status = project.diffSummary()
        }
    }
    return status
}

export function getBranch(filePath?: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const options: IExecOptions = {}
        if (filePath) {
            options.cwd = filePath
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
