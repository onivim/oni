/**
 * Git.ts
 *
 * Utilities around Git
 */

import { exec } from "child_process"
import * as Q from "q"

interface IExecOptions {
    cwd?: string
}

export function getBranch(path?: string): Q.Promise<string> {
        const options: IExecOptions = {}
        if (path) {
            options.cwd = path
        }

        const deferred = Q.defer<string>()
        exec("git rev-parse --abbrev-ref HEAD", options, (error: any, stdout: string, stderr: string) => {
            if (error && error.code) {
                deferred.reject(new Error(stderr))
            } else {
                deferred.resolve(stdout)
            }
        })
        return deferred.promise
    };