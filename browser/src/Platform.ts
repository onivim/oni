import * as os from "os"

export const isWindows = () => os.platform() === "win32"

export const getUserHome = () => {
    return isWindows() ? process.env["USERPROFILE"] : process.env["HOME"] // tslint:disable-line no-string-literal
}
