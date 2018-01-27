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

// FIXME: Returns a string however is typed to return { stderr: any; stdout: any }
const execPromise = promisify(exec) as any

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

const numFromString = (s: string) => Number(s.match(/\d+/)[0])

const formatFileAndChanges = (files: string[]) => {
    if (!files.length) {
        return null
    }
    return files.map(unformattedStr => {
        const [file, changes] = unformattedStr.split("|")
        const insertions = changes.replace(/[^+]/g, "").split("+").length
        const deletions = changes.replace(/[^-]/g, "").split("-").length
        return {
            file: file.trim(),
            changes: numFromString(changes),
            insertions,
            deletions,
        }
    })
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

export async function getGitSummary(currentDir: string): Promise<IStatus | null> {
    let status = null
    if (currentDir) {
        // TODO: .customBinary()
        const project = git(currentDir)
        const isRepo = await project.checkIsRepo()
        if (isRepo) {
            // status = await project.diffSummary()
            // if (status.files || status.deletions || status.insertions) {
            //     return status
            // }
            const options: IExecOptions = {
                cwd: currentDir,
            }
            const cmd = `git diff --stat=4096`
            try {
                const output = await execPromise(cmd, options)
                if (output) {
                    const outputArray = output.split("\n").filter((v: string) => !!v)
                    const changeSummary = outputArray[outputArray.length - 1]
                    const filesChanged = outputArray.slice(0, outputArray.length - 1)
                    const [modified, insertions, deletions] = changeSummary
                        .split(",")
                        .map(numFromString)
                    const files = formatFileAndChanges(filesChanged)

                    status = { files, insertions, deletions, modified }
                }
            } catch (e) {
                // tslint:disable-next-line
                console.warn("[Oni.Git.Plugin]:", e)
                return status
            }
        }
    }
    return status
}

export async function getBranch(filePath?: string): Promise<string> {
    const options: IExecOptions = {}
    if (filePath) {
        options.cwd = filePath
    }

    const result = await execPromise("git rev-parse --abbrev-ref HEAD", options)
    return result
}
