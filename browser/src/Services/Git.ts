/**
 * Git.ts
 *
 * Utilities around Git
 */

import { exec } from "child_process"

interface IExecOptions {
    cwd?: string
}

export function getBranch(path?: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const options: IExecOptions = {}
        if (path) {
            options.cwd = path
        }

        exec(
            "git rev-parse --abbrev-ref HEAD",
            options,
            (error: any, stdout: string, stderr: string) => {
                if (error && error.code) {
                    reject(new Error(stderr))
                } else {
                    resolve(stdout)
                }
            },
        )
    })
}
