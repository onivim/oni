import { execSync } from "child_process"
import * as Q from "q"

/**
 * API instance for interacting with Oni (and vim)
 */
export class Git implements Oni.Git {
    public getBranch(): Q.Promise<String> {
        let cmd = "git rev-parse --abrev-ref HEAD"
        const branchName = execSync(cmd).toString("utf8")
        return Q.resolve(branchName)
    }

}
