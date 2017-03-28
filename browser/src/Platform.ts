import * as os from "os"

export const isWindows = () => os.platform() === "win32"
export const isMac = () => os.platform() === "darwin"
export const isLinux = () => os.platform() === "linux"

export const getUserHome = () =>
    isWindows() ? process.env["USERPROFILE"] : process.env["HOME"] // tslint:disable-line no-string-literal
