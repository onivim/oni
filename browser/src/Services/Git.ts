/**
 * Git.ts
 *
 * Utilities around Git
 */

import { exec, execSync } from "child_process"
import * as Q from "q"

export function isGitRepository(): Q.Promise<any> {
    const deferred = Q.defer<boolean>()

    exec("git log --oneline -n1", (err: any) => {
        if (err && err.code) {
            deferred.resolve(false)
        } else {
            deferred.resolve(true)
        }
    })

    return deferred.promise
}

export function getTrackedFiles(): Q.Promise<string[]> {
    const trackedFiles = execSync("git ls-files").toString("utf8").split("\n")
    return Q.resolve(trackedFiles)
}

export function getUntrackedFiles(exclude: string[]): Q.Promise<string[]> {
    let cmd = "git ls-files --others --exclude-standard" + exclude.map((dir) => " -x " + dir).join("")
    const untrackedFiles = execSync(cmd).toString("utf8").split("\n")
    return Q.resolve(untrackedFiles)
}
