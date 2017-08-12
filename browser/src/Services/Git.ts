/**
 * Git.ts
 *
 * Utilities around Git
 */

import { exec } from "child_process"

interface IExecOptions {
    cwd?: string
}

export function isGitRepository(): Promise<boolean> {
    return new Promise((resolve, reject) => {
        exec("git log --oneline -n1", (err: any) => {
            if (err && err.code) {
                resolve(false)
            } else {
                resolve(true)
            }
        })
    })
}

export function getTrackedFiles(): Promise<string[]> {
    return new Promise((resolve, reject) => {
        exec("git ls-files", (error, stdout) => {
            if (error) {
                reject(error)
                return
            }

            const output = stdout.split("\n")
            resolve(output)
        })
    })
}

export function getUntrackedFiles(exclude: string[]): Promise<string[]> {
    return new Promise((resolve, reject) => {
        let cmd = "git ls-files --others --exclude-standard" + exclude.map((dir) => " -x " + dir).join("")

        exec(cmd, (error, stdout) => {
            if (error) {
                reject(error)
                return
            }

            const output = stdout.split("\n")
            resolve(output)
        })
    })
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
